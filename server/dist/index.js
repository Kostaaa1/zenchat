"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@trpc/server/adapters/express");
const routers_1 = require("./routers");
const initSocket_1 = require("./config/initSocket");
const socket_io_1 = require("socket.io");
require("dotenv/config");
const context_1 = require("./context");
const decodeAndVerifyToken_1 = require("./utils/jwt/decodeAndVerifyToken");
const upload_1 = __importDefault(require("./routers/upload"));
const { CLIENT_URL } = process.env;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
    },
});
(0, initSocket_1.initSocket)(io);
app.use("/api/uploadMedia", decodeAndVerifyToken_1.decodeAndVerifyToken, upload_1.default);
app.use("/api/trpc", (0, express_2.createExpressMiddleware)({
    router: routers_1.appRouter,
    createContext: context_1.createContext,
}));
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map