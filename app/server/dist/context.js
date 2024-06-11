"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const createContext = ({ req, res }) => {
    return {
        req,
        res,
        session: null,
    };
};
exports.createContext = createContext;
//# sourceMappingURL=context.js.map