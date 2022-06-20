"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const { get } = axios_1.default;
class Zlibrary extends models_1.BookParser {
    constructor() {
        super(...arguments);
        this.baseUrl = 'https://3lib.net/';
        this.name = 'ZLibrary';
        this.classPath = 'BOOKS.Zlibrary';
        this.logo = `${this.baseUrl}img/logo.zlibrary.png`;
        this.search = (bookUrl) => __awaiter(this, void 0, void 0, function* () {
            const data = yield get(`${this.baseUrl}s/${bookUrl}`);
        });
    }
}
//# sourceMappingURL=zLibrary.js.map