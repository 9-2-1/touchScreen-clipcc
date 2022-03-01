var __webpack_modules__ = ({
"./index.js": ((module, __unused_webpack_exports, __webpack_require__) => {
const { Extension, type, api } = __webpack_require__("clipcc-extension");
// --- index.js 开始 ---
class TC_touch extends Extension {

	onInit() {
		api.addCategory({
			categoryId: "touchScreen",
			messageId: "touchScreen.category",
			color: "#ff99ff"
		});

		api.addBlock({
			opcode: "firstpoint",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.firstpoint",
			categoryId: "touchScreen",
			function: function(){return '还在制作';},
			param: {}
		});
		
		api.addBlock({
			opcode: "nextpoint",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.nextpoint",
			categoryId: "touchScreen",
			function: function(){return '还在制作';},
			param: {
				PREV: {
					type: type.ParameterType.NUMBER,
					default: '0'
				}
			}
		});
		
		api.addBlock({
			opcode: "resetindex",
			type: type.BlockType.BUTTON,
			messageId: "touchScreen.resetindex",
			categoryId: "touchScreen",
			function: function(){alert("还在制作")},
			param: {}
		});
		
		api.addBlock({
			opcode: "touchx",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.touchx",
			categoryId: "touchScreen",
			function: function(){return '还在制作';},
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
			function: function(){return '还在制作';},
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
			function: function(){return false;},
			param: {}
		});

		api.addBlock({
			opcode: "hastouchpoint",
			type: type.BlockType.BOOLEAN,
			messageId: "touchScreen.hastouchpoint",
			categoryId: "touchScreen",
			function: function(){return false;},
			param: {}
		});

		api.addBlock({
			opcode: "countpoint",
			type: type.BlockType.REPORTER,
			messageId: "touchScreen.countpoint",
			categoryId: "touchScreen",
			function: function(){return '还在制作';},
			param: {}
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
