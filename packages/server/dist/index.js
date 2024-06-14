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
const context_1 = require("./context");
const decodeAndVerifyToken_1 = require("./utils/jwt/decodeAndVerifyToken");
const upload_1 = __importDefault(require("./routers/upload"));
const config_1 = require("./config/config");
const socket_io_1 = require("socket.io");
const { PORT } = config_1.env;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/api/upload", decodeAndVerifyToken_1.decodeAndVerifyToken, upload_1.default);
app.use("/api/trpc", (0, express_2.createExpressMiddleware)({
    router: routers_1.appRouter,
    createContext: context_1.createContext,
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
(0, initSocket_1.initSocket)(io);
app.get("/", (_, res) => res.send("Hello from zanchat server"));
const port = PORT || 8000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map