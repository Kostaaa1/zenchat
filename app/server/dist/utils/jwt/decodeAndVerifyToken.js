"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAndVerifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
// @ts-ignore
const cookies_1 = __importDefault(require("cookies"));
const decodeAndVerifyToken = (req, res, next) => {
    const PUBLIC_KEY = fs_1.default.readFileSync("./clerk_public_key.pem");
    if (!PUBLIC_KEY)
        throw new Error("No PUBLIC_KEY provided. Clerk JWT PUBLIC_KEY needed in root of server directory.");
    const cookies = new cookies_1.default(req, res);
    const sessionToken = cookies.get("__session");
    const handleError = (status, error) => {
        if (next) {
            res.status(status).send(error);
        }
        else {
            return;
        }
    };
    const token = req.headers["authorization"];
    if (token === undefined && sessionToken === undefined) {
        handleError(400, "Access token/session not provided.");
    }
    try {
        let decoded;
        if (token) {
            decoded = jsonwebtoken_1.default.verify(token.split(" ")[1], PUBLIC_KEY, { algorithms: ["RS256"] });
        }
        else {
            decoded = jsonwebtoken_1.default.verify(sessionToken, PUBLIC_KEY, { algorithms: ["RS256"] });
        }
        if (next) {
            next();
        }
        else {
            return decoded;
        }
    }
    catch (err) {
        handleError(500, err);
    }
};
exports.decodeAndVerifyToken = decodeAndVerifyToken;
//# sourceMappingURL=decodeAndVerifyToken.js.map