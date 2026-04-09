"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDecimalInput = exports.DECIMAL_STRING_REGEX = void 0;
exports.DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;
const isValidDecimalInput = (v) => {
    if (v === undefined || v === null)
        return false;
    return ((typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
        (typeof v === 'string' && exports.DECIMAL_STRING_REGEX.test(v)) ||
        typeof v === 'number');
};
exports.isValidDecimalInput = isValidDecimalInput;
exports.default = exports.isValidDecimalInput;
//# sourceMappingURL=isValidDecimalInput.js.map