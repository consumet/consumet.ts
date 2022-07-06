"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countDivs = void 0;
const countDivs = (s) => {
    let counter = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] == '<' && s[i + 1] == 'd' && s[i + 2] == 'i' && s[i + 3] == 'v')
            counter++;
    }
    return counter;
};
exports.countDivs = countDivs;
//# sourceMappingURL=zLibrary.js.map