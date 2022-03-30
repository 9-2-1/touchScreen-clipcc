const {
	Extension,
	type,
	api
} = require("clipcc-extension");
// --- index.js 开始 ---
let stage;
let touches = [];
let touchid = {};
let touchLastid = 1;
let touchTheStage = false;
let touchedTarget = [];
let evTouchList = [];
let evMouse = {
	down: false
};
let enableMouse = false;
let isTouchMode = false;
let newExpireTime = null;
let scratchVM = null;

function clamp(x, min, max) {
	return x > max ? max : x < min ? min : x;
}

function updateTouch(event) {
	isTouchMode = true;
	evTouchList = event.targetTouches;
	updateList();
}

function updateMouse(event) {
	let rect = stage.getBoundingClientRect();
	isTouchMode = false;
	switch (event.type) {
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

function updateList() {
	try {
		let vaild = {};
		let rect = stage.getBoundingClientRect();
		let touchList = [];
		touches = [];
		for (let i = 0; i < evTouchList.length; i++) {
			touchList.push(evTouchList[i]);
		}
		if (evMouse.down) {
			let haveTouch = false;
			for (let i = 0; i < touchList.length; i++) {
				if (touchList[i].clientX === evMouse.clientX &&
					touchList[i].clientY === evMouse.clientY) {
					haveTouch = true;
				}
			}
			if (haveTouch) {
				isTouchMode = true;
			} else {
				if (enableMouse) {
					touchList.push(evMouse);
				}
			}
		}
		for (let i = 0; i < touchList.length; i++) {
			let touch = touchList[i];
			if (!(touch.identifier in touchid)) {
				touchTheStage = true;
				/* console.log(
											touch.clientX - rect.left,
											touch.clientY - rect.top
										); */
				touchedTarget.push(pickTarget(
					touch.clientX - rect.left,
					touch.clientY - rect.top
				));
				touchid[touch.identifier] = touchLastid;
				touchLastid++;
			}
			vaild[touch.identifier] = true;
			touches.push({
				isFinger: !touch.down,
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
		for (let i in touchid) {
			if (!vaild[i]) {
				delete touchid[i];
			}
		}
	} catch (e) {
		alert(e.message);
	}
}

// scratch-vm/io/mouse.js:40
function pickTarget(x, y) {
	if (scratchVM.runtime.renderer) {
		const drawableID = scratchVM.runtime.renderer.pick(x, y);
		// console.log("wjw",drawableID);
		for (let i = 0; i < scratchVM.runtime.targets.length; i++) {
			const target = scratchVM.runtime.targets[i];
			// console.log(target.drawableID);
			if (target.hasOwnProperty('drawableID') &&
				target.drawableID === drawableID) {
				// console.log("haha",target.drawableID);
				return target;
			}
		}
	}
	// Return the stage if no target was found
	return scratchVM.runtime.getTargetForStage();
}
class TC_touch extends Extension {
	onInit() {
		stage = api.getStageCanvas() || document.querySelector("*[class*=stage_stage_] canvas");
		scratchVM = api.getVmInstance();
		if (!stage) {
			alert("six6.touchScreen:\n" +
				"无法定位舞台，所有积木的数值将为 0 或者 false。" +
				"Cannot identify the stage, the return value of the extension will be 0 or false.");
		} else {
			stage.addEventListener('touchstart', updateTouch);
			stage.addEventListener('touchmove', updateTouch);
			stage.addEventListener('touchend', updateTouch);
			stage.addEventListener('touchcancel', updateTouch);
			stage.addEventListener('mousedown', updateMouse);
			stage.addEventListener('mousemove', updateMouse);
			stage.addEventListener('mouseup', updateMouse);
		}

		touches = [];
		touchid = {};
		touchLastid = 1;
		touchTheStage = false;
		touchedTarget = [];
		evTouchList = [];
		evMouse = {
			down: false
		};
		enableMouse = false;
		isTouchMode = false;
		newExpireTime = null;

		api.addCategory({
			categoryId: "six6.touchScreen",
			messageId: "six6.touchScreen.category",
			color: "#ff33cc"
		});

		api.addBlock({
			opcode: "six6.touchScreen.firstpoint",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.firstpoint",
			categoryId: "six6.touchScreen",
			function: function() {
				return touches.length !== 0 ? touches[0].id : 0;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.nextpoint",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.nextpoint",
			categoryId: "six6.touchScreen",
			function: function(args) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].id === Number(args.PREV)) {
						return i === touches.length - 1 ?
							0 : touches[i + 1].id;
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
			opcode: "six6.touchScreen.resetindex",
			type: type.BlockType.COMMAND,
			messageId: "six6.touchScreen.resetindex",
			categoryId: "six6.touchScreen",
			function: function() {
				touches = [];
				touchid = {};
				touchLastid = 1;
				touchedTarget = [];
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.touchdown",
			type: type.BlockType.BOOLEAN,
			messageId: "six6.touchScreen.touchdown",
			categoryId: "six6.touchScreen",
			function: function(args) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].id === Number(args.POINT)) {
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
			opcode: "six6.touchScreen.touchx",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.touchx",
			categoryId: "six6.touchScreen",
			function: function(args) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].id === Number(args.POINT)) {
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
			opcode: "six6.touchScreen.touchy",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.touchy",
			categoryId: "six6.touchScreen",
			function: function(args) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].id === Number(args.POINT)) {
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
			opcode: "six6.touchScreen.whentouchthesprite",
			type: type.BlockType.HAT,
			messageId: "six6.touchScreen.whentouchthesprite",
			categoryId: "six6.touchScreen",
			function: function(args, util) {
				let tidx = touchedTarget.indexOf(util.target);
				if (tidx === -1) {
					return false;
				} else {
					touchedTarget.splice(tidx, 1);
					return true;
				}
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.hastouchpoint",
			type: type.BlockType.BOOLEAN,
			messageId: "six6.touchScreen.hastouchpoint",
			categoryId: "six6.touchScreen",
			function: function() {
				return touches.length !== 0;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.countpoint",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.countpoint",
			categoryId: "six6.touchScreen",
			function: function() {
				return touches.length;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.istouchmode",
			type: type.BlockType.BOOLEAN,
			messageId: "six6.touchScreen.istouchmode",
			categoryId: "six6.touchScreen",
			function: function() {
				return isTouchMode;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.enablemouse",
			type: type.BlockType.COMMAND,
			messageId: "six6.touchScreen.enablemouse",
			categoryId: "six6.touchScreen",
			function: function() {
				enableMouse = true;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.disablemouse",
			type: type.BlockType.COMMAND,
			messageId: "six6.touchScreen.disablemouse",
			categoryId: "six6.touchScreen",
			function: function() {
				evMouse.down = false;
				enableMouse = false;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.ismouse",
			type: type.BlockType.BOOLEAN,
			messageId: "six6.touchScreen.ismouse",
			categoryId: "six6.touchScreen",
			function: function(args) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].id === Number(args.POINT)) {
						return !touches[i].isFinger;
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
			opcode: "six6.touchScreen.istouch",
			type: type.BlockType.BOOLEAN,
			messageId: "six6.touchScreen.istouch",
			categoryId: "six6.touchScreen",
			function: function(args, util) {
				for (let i = 0; i < touches.length; i++) {
					let touch = util.target.isTouchingPoint(
						touches[i].clientX, touches[i].clientY);
					if (touch) {
						return true;
					}
				}
				return false;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.counttouch",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.counttouch",
			categoryId: "six6.touchScreen",
			function: function(args, util) {
				let count = 0;
				for (let i = 0; i < touches.length; i++) {
					let touch = util.target.isTouchingPoint(
						touches[i].clientX, touches[i].clientY);
					if (touch) {
						count++;
					}
				}
				return count;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.getfirsttouchpoint",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.getfirsttouchpoint",
			categoryId: "six6.touchScreen",
			function: function(args, util) {
				for (let i = 0; i < touches.length; i++) {
					let touch = util.target.isTouchingPoint(
						touches[i].clientX, touches[i].clientY);
					if (touch) {
						return touches[i].id;
					}
				}
				return 0;
			},
			param: {}
		});

		api.addBlock({
			opcode: "six6.touchScreen.getnexttouchpoint",
			type: type.BlockType.REPORTER,
			messageId: "six6.touchScreen.getnexttouchpoint",
			categoryId: "six6.touchScreen",
			function: function(args, util) {
				let found = false;
				for (let i = 0; i < touches.length; i++) {
					if (found) {
						let touch = util.target.isTouchingPoint(
							touches[i].clientX, touches[i].clientY);
						if (touch) {
							return touches[i].id;
						}
					} else {
						if (touches[i].id === args.PREV) {
							found = true;
						}
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
			opcode: "six6.touchScreen.checktouchpoint",
			type: type.BlockType.BOOLEAN,
			messageId: "six6.touchScreen.checktouchpoint",
			categoryId: "six6.touchScreen",
			function: function(args, util) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].id === Number(args.POINT)) {
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

	onUninit() {
		api.removeCategory("six6.touchScreen");
		if (stage) {
			stage.removeEventListener('touchstart', updateTouch);
			stage.removeEventListener('touchmove', updateTouch);
			stage.removeEventListener('touchend', updateTouch);
			stage.removeEventListener('touchcancel', updateTouch);
			stage.removeEventListener('mousedown', updateMouse);
			stage.removeEventListener('mousemove', updateMouse);
			stage.removeEventListener('mouseup', updateMouse);
		}
	}
}
module.exports = TC_touch;
