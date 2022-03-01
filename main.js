var __webpack_modules__ = ({
"./index.js": ((module, __unused_webpack_exports, __webpack_require__) => {
const { Extension, type, api } = __webpack_require__("clipcc-extension");
// --- index.js 开始 ---
var stage;
var touches = [];
var touchid = {};
var touchLastid = 1;
var newTouch = false;
function O_I(x){
	return x > 1 ? 1 : x < 0 ? 0 : x;
}
function viewLeft(element){
	return element.getBoundingClientRect().left + element.style.borderWidth;
}
function viewTop(element){
	return element.getBoundingClientRect().top + element.style.borderWidth;
}
function updateTouch(event){
	try{
	var list = event.targetTouches;
	var vaild = {};
	touches = [];
	for(var i=0;i<list.length;i++){
		var touch = list[i];
		if(!(touch.identifier in touchid)){
			newTouch = true;
			touchid[touch.identifier] = touchLastid;
			touchLastid++;
		}
		vaild[touch.identifier] = true;
		touches.push({
			id: touchid[touch.identifier],
			x: Math.floor(-240 + 480 * O_I((touch.clientX - viewLeft(stage)) / stage.clientWidth)),
			y: Math.floor(180 - 360 * O_I((touch.clientY - viewTop(stage)) / stage.clientHeight))
		});
	}
	for(var i in touchid){
		if(!vaild[i]){
			delete touchid[i];
		}
	}
	
	}catch(e){alert(e.message)}
}

class TC_touch extends Extension {
	onInit() {
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

		stage = document.querySelector("*[class*=stage_stage_]");
		if(!stage){
			alert("无法加载此插件");
		}
		stage.addEventListener('touchstart',updateTouch);
		stage.addEventListener('touchmove',updateTouch);
		stage.addEventListener('touchend',updateTouch);
		stage.addEventListener('touchcancel',updateTouch);
		
		
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
