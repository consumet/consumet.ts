"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitStar = exports.getSize = void 0;
const getSize = (s) => {
    let result = '';
    for (let i = 0; i < s.length; i < s.length) {
        if (result != '' || s[i] == ',') {
            i += 2;
            result += s[i];
        }
    }
    return result;
};
exports.getSize = getSize;
const splitStar = (s) => {
    let rating = '';
    let quality = '';
    let switcher = false;
    for (let i = 0; i < s.length; i++) {
        if (s[i] == '/') {
            switcher = true;
            break;
        }
        if (!switcher) {
            rating += s[i];
        }
        else {
            quality += s[i];
        }
    }
    return { rating, quality };
};
exports.splitStar = splitStar;
//# sourceMappingURL=zLibrary.js.map