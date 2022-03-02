var __webpack_modules__ = ({
"./index.js": ((module, __unused_webpack_exports, __webpack_require__) => {
const { Extension, type, api } = __webpack_require__("clipcc-extension");
// --- index.js 开始 ---
var stage;
var touches = [];
var touchid = {};
var touchLastid = 1;
var newTouch = false;
var evTouchList = [];
var evMouse = {down:false};
var enableMouse = false;
var isTouchMode = false;
function clamp(x, min, max){
	return x > max ? max : x < min ? min : x;
}
function updateTouch(event){
	isTouchMode = true;
	evTouchList = event.targetTouches;
	updateList();
}
function updateMouse(event){
	isTouchMode = false;
	var rect = stage.getBoundingClientRect();
	switch(event.type){
		case "mouseup":
			evMouse.down = false;
			break;
		case "mousedown":
			evMouse.down = true;
			evMouse.identifier = Math.random();
			// break;
		case "mousemove":
			evMouse.clientX = event.clientX;
			evMouse.clientY = event.clientY;
			break;
	}
	updateList();
}
function updateList(){
	try{
	var vaild = {};
	touches = [];
	var rect = stage.getBoundingClientRect();
	var touchList = [];
	for(var i=0;i<evTouchList.length;i++){
		touchList.push(evTouchList[i]);
	}
	if(evMouse.down){
		var haveTouch = false;
		for(var i=0;i<touchList.length;i++){
			if(touchList[i].clientX === evMouse.clientX
			&& touchList[i].clientY === evMouse.clientY){
				haveTouch = true;
			}
		}
		if(haveTouch){
			isTouchMode = true;
		}else{
			if(enableMouse){
				touchList.push(evMouse);
			}
		}
	}
	for(var i=0;i<touchList.length;i++){
		var touch = touchList[i];
		if(!(touch.identifier in touchid)){
			newTouch = true;
			touchid[touch.identifier] = touchLastid;
			touchLastid++;
		}
		vaild[touch.identifier] = true;
		touches.push({
			id: touchid[touch.identifier],
			x: clamp(
				Math.round(480 * ((touch.clientX - rect.left) / rect.width - 0.5)),
				-240,
				240
			),
			y: clamp(
				Math.round(-360 * ((touch.clientY - rect.top) / rect.height - 0.5)),
				-180,
				180
			),
			clientX: touch.clientX - rect.left,
			clientY: touch.clientY - rect.top
		});
	}
	for(var i in touchid){
		if(!vaild[i]){
			delete touchid[i];
		}
	}
	}catch(e){alert(e.message);}
}

class TC_touch extends Extension {
	onInit() {
		stage = api.getStageCanvas() || document.querySelector("*[class*=stage_stage_] canvas");
		if(!stage){
			alert("touchScreen:\n" +
			"无法定位舞台，所有积木的数值将为 0 或者 false。" +
			"Cannot identify the stage, the return value of the extension will be 0 or false.");
		}else{
			stage.addEventListener('touchstart',updateTouch);
			stage.addEventListener('touchmove',updateTouch);
			stage.addEventListener('touchend',updateTouch);
			stage.addEventListener('touchcancel',updateTouch);
			stage.addEventListener('mousedown',updateMouse);
			stage.addEventListener('mousemove',updateMouse);
			stage.addEventListener('mouseup',updateMouse);
		}
		
		api.addCategory({
			categoryId: "touchScreen",
			messageId: "touchScreen.category",
			color: "#ff33cc"
		});

		api.addBlock({
			opcode: "firstpoint",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.firstpoint",
			categoryId: "touchScreen",
			function: function(){
				return touches.length !== 0 ? touches[0].id : 0;
			},
			param: {}
		});
		
		api.addBlock({
			opcode: "nextpoint",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.nextpoint",
			categoryId: "touchScreen",
			function: function(args){
				for(var i=0;i<touches.length;i++){
					if(touches[i].id===Number(args.PREV)){
						return i===touches.length-1 ?
							0 : touches[i+1].id;
					}
				}
				return 0;
			},
			param: {
				PREV: {
					type: type.ParameterType.NUMBER,
					default: '0'
				}
			}
		});
		
		api.addBlock({
			opcode: "resetindex",
			type: type.BlockType.COMMAND,
			messageId: "touchScreen.resetindex",
			categoryId: "touchScreen",
			function: function(){
				touches = [];
				touchid = {};
				touchLastid = 1;
				newTouch = false;
			},
			param: {}
		});
		
		api.addBlock({
			opcode: "touchdown",
			type: type.BlockType.BOOLEAN,
			messageId: "touchScreen.touchdown",
			categoryId: "touchScreen",
			function: function(args){
				for(var i=0;i<touches.length;i++){
					if(touches[i].id===Number(args.POINT)){
						return true;
					}
				}
				return false;
			},
			param: {
				POINT: {
					type: type.ParameterType.NUMBER,
					default: '0'
				}
			}
		});

		api.addBlock({
			opcode: "touchx",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.touchx",
			categoryId: "touchScreen",
			function: function(args){
				for(var i=0;i<touches.length;i++){
					if(touches[i].id===Number(args.POINT)){
						return touches[i].x;
					}
				}
				return 0;
			},
			param: {
				POINT: {
					type: type.ParameterType.NUMBER,
					default: '0'
				}
			}
		});

		api.addBlock({
			opcode: "touchy",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.touchy",
			categoryId: "touchScreen",
			function: function(args){
				for(var i=0;i<touches.length;i++){
					if(touches[i].id===Number(args.POINT)){
						return touches[i].y;
					}
				}
				return 0;
			},
			param: {
				POINT: {
					type: type.ParameterType.NUMBER,
					default: '0'
				}
			}
		});

		api.addBlock({
			opcode: "whentouchthestage",
			type: type.BlockType.HAT,
			messageId: "touchScreen.whentouchthestage",
			categoryId: "touchScreen",
			function: function(){
				var value = newTouch;
				newTouch = false;
				return value;
			},
			param: {}
		});

		api.addBlock({
			opcode: "hastouchpoint",
			type: type.BlockType.BOOLEAN,
			messageId: "touchScreen.hastouchpoint",
			categoryId: "touchScreen",
			function: function(){return touches.length !== 0;},
			param: {}
		});

		api.addBlock({
			opcode: "countpoint",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.countpoint",
			categoryId: "touchScreen",
			function: function(){return touches.length;},
			param: {}
		});

		api.addBlock({
			opcode: "istouchmode",
			type: type.BlockType.BOOLEAN,
			messageId: "touchScreen.istouchmode",
			categoryId: "touchScreen",
			function: function(){return isTouchMode;},
			param: {}
		});

		api.addBlock({
			opcode: "enablemouse",
			type: type.BlockType.COMMAND,
			messageId: "touchScreen.enablemouse",
			categoryId: "touchScreen",
			function: function(){
				enableMouse = true;
			},
			param: {}
		});

		api.addBlock({
			opcode: "disablemouse",
			type: type.BlockType.COMMAND,
			messageId: "touchScreen.disablemouse",
			categoryId: "touchScreen",
			function: function(){
				evMouse.down = false;
				enableMouse = false;
			},
			param: {}
		});

		api.addBlock({
			opcode: "istouch",
			type: type.BlockType.BOOLEAN,
			messageId: "touchScreen.istouch",
			categoryId: "touchScreen",
			function: function(args, util){
				for(var i=0;i<touches.length;i++){
					var touch = util.target.isTouchingPoint(
						touches[i].clientX, touches[i].clientY);
					if(touch){
						return true;
					}
				}
				return false;
			},
			param: {}
		});

		api.addBlock({
			opcode: "counttouch",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.counttouch",
			categoryId: "touchScreen",
			function: function(args, util){
				var count = 0;
				for(var i=0;i<touches.length;i++){
					var touch = util.target.isTouchingPoint(
						touches[i].clientX, touches[i].clientY);
					if(touch){
						count++;
					}
				}
				return count;
			},
			param: {}
		});

		api.addBlock({
			opcode: "getfirsttouchpoint",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.getfirsttouchpoint",
			categoryId: "touchScreen",
			function: function(args, util){
				for(var i=0;i<touches.length;i++){
					var touch = util.target.isTouchingPoint(
						touches[i].clientX, touches[i].clientY);
					if(touch){
						return touches[i].id;
					}
				}
				return 0;
			},
			param: {}
		});

		api.addBlock({
			opcode: "checktouchpoint",
			type: type.BlockType.BOOLEAN,
			messageId: "touchScreen.checktouchpoint",
			categoryId: "touchScreen",
			function: function(args, util){
				for(var i=0;i<touches.length;i++){
					if(touches[i].id===Number(args.POINT)){
						return util.target.isTouchingPoint(
							touches[i].clientX, touches[i].clientY);
					}
				}
				return false;
			},
			param: {
				POINT: {
					type: type.ParameterType.NUMBER,
					default: '0'
				}
			}
		});

		/* api.addBlock({
			opcode: '...',
			type: type.BlockType.xxx,
			messageId: '...',
			categoryId: '...',
			function: ...,
			param: {
				xxx: {
					type: type.ParameterType.xxx,
					default: '...'
				}
			}
		}); */
	}

	onUninit(){
		api.removeCategory("touchScreen");
		if(stage){
			stage.removeEventListener('touchstart',updateTouch);
			stage.removeEventListener('touchmove',updateTouch);
			stage.removeEventListener('touchend',updateTouch);
			stage.removeEventListener('touchcancel',updateTouch);
			stage.removeEventListener('mousedown',updateMouse);
			stage.removeEventListener('mousemove',updateMouse);
			stage.removeEventListener('mouseup',updateMouse);
		}
	}
}
module.exports = TC_touch;
// --- index.js 结束 ---
}),
"clipcc-extension":((module) => {module.exports = self["ClipCCExtension"];})
});

var __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
	var cachedModule = __webpack_module_cache__[moduleId];
	if (cachedModule !== undefined) {
		return cachedModule.exports;
	}
	var module = __webpack_module_cache__[moduleId] = {
		exports: {}
	};
	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
	return module.exports;
}

var __webpack_exports__ = __webpack_require__("./index.js");
module.exports = __webpack_exports__;
