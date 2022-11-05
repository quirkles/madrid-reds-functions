/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./functions/shared/services/crypto/index.ts":
/*!***************************************************!*\
  !*** ./functions/shared/services/crypto/index.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CryptoService = void 0;\nconst crypto = __importStar(__webpack_require__(/*! crypto */ \"crypto\"));\nclass CryptoService {\n    constructor(encryptionSecret) {\n        this.defaultAlgorithm = 'aes-192-cbc';\n        this.encryptionKey = crypto.scryptSync(encryptionSecret, 'salt', 24);\n    }\n    encrypt(params) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const initializationVector = params.initializationVector || crypto.randomFillSync(Buffer.alloc(16, 0));\n            const algorithm = params.algorithmUsedToEncrypt || this.defaultAlgorithm;\n            const key = this.encryptionKey;\n            return new Promise((resolve, reject) => {\n                // Create Cipher with key and iv\n                const cipher = crypto.createCipheriv(algorithm, key, initializationVector);\n                let encrypted = '';\n                cipher.setEncoding('hex');\n                cipher.on('data', (chunk) => { encrypted += chunk; });\n                cipher.on('end', () => resolve({\n                    result: encrypted,\n                    initializationVector,\n                    algorithmUsedToEncrypt: algorithm\n                })); // Prints encrypted data with key\n                cipher.write(params.unencryptedInput);\n                cipher.end();\n            });\n        });\n    }\n    decrypt(params) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const algorithm = params.algorithmUsedToEncrypt || this.defaultAlgorithm;\n            const key = this.encryptionKey;\n            const initializationVector = params.initializationVector;\n            return new Promise((resolve, reject) => {\n                // Create decipher with key and iv\n                const decipher = crypto.createDecipheriv(algorithm, key, initializationVector);\n                let decrypted = '';\n                decipher.on('readable', () => {\n                    let chunk;\n                    while ((chunk = decipher.read()) !== null) {\n                        decrypted += chunk.toString('utf8');\n                    }\n                });\n                decipher.on('end', () => {\n                    return resolve(decrypted);\n                });\n                decipher.write(params.encryptedInput, 'hex');\n                decipher.end();\n            });\n        });\n    }\n    generateSecret(length = 20) {\n        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);\n    }\n}\nexports.CryptoService = CryptoService;\n\n\n//# sourceURL=webpack://functions/./functions/shared/services/crypto/index.ts?");

/***/ }),

/***/ "./functions/verifyEmail/main.ts":
/*!***************************************!*\
  !*** ./functions/verifyEmail/main.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.verifyEmailHandler = void 0;\nconst crypto_1 = __webpack_require__(/*! ../shared/services/crypto */ \"./functions/shared/services/crypto/index.ts\");\n// https://mr-dev-verify-email-wgvygz45ba-uc.a.run.app/?iv=1c773c6476df531206aa5cb788de7732&verificationToken=78aa94f99e004eb9c7f63791a68066399f5ebdd39f4f7ceeca293bf2e75d7e2410187ea547da616b4a126caae5230b4d45cda7188dbc56d2b9c3ff663a6a36d4\nfunction verifyEmailHandler(req, res) {\n    return __awaiter(this, void 0, void 0, function* () {\n        const encryptionSecret = process.env.VERIFY_EMAIL_SECRET;\n        if (!encryptionSecret) {\n            throw new Error('VERIFY_EMAIL_SECRET must be set as an env var');\n        }\n        const iv = req.query[\"iv\"];\n        if (!iv || typeof iv !== 'string') {\n            throw new Error('iv string query param required');\n        }\n        const jwt = req.query[\"jwt\"];\n        if (!jwt || typeof jwt !== 'string') {\n            throw new Error('jwt string query param required');\n        }\n        const cryptoService = new crypto_1.CryptoService(encryptionSecret);\n        return res.send('Hello World!');\n    });\n}\nexports.verifyEmailHandler = verifyEmailHandler;\n;\n// http('main', verifyEmailHandler);\n\n\n//# sourceURL=webpack://functions/./functions/verifyEmail/main.ts?");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./functions/verifyEmail/main.ts");
/******/ 	
/******/ })()
;