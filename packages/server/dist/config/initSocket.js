"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = exports.rooms = void 0;
const supabase_1 = __importDefault(require("./supabase"));
const chatroom_1 = require("../utils/supabase/chatroom");
const initSocket = (io) => {
    io.on("connection", (socket) => {
        exports.rooms = io.sockets.adapter.rooms;
        socket.on("join-room", async (userId) => {
            if (!userId || exports.rooms.has(userId))
                return;
            socket.join(userId);
            socket.leave(socket.id);
            console.log("Joined room: ", userId, "Rooms", exports.rooms);
        });
        socket.on("rtc", async (data) => {
            const { type, receivers } = data;
            if (type === "offer") {
                for (const user of receivers) {
                    if (user !== data.caller) {
                        io.to(user).emit("rtc", data);
                    }
                }
            }
            if (type === "answer") {
                io.to(data.caller).emit("rtc", data);
            }
            if (type === "ice") {
                for (const receiver of receivers) {
                    if (receiver !== data.caller) {
                        io.to(receiver).emit("rtc", data);
                    }
                }
            }
        });
        socket.on("call", (payload) => {
            const { caller, receivers, type } = payload;
            if (type === "initiated") {
                for (const receiver of receivers) {
                    if (receiver !== caller.id) {
                        io.to(receiver).emit("call", payload);
                    }
                }
            }
            else if (type === "hangup") {
                for (const receiver of receivers) {
                    io.to(receiver).emit("call", payload);
                }
            }
            else {
                io.to(caller.id).emit("call", payload);
            }
        });
        socket.on("onMessage", () => {
            try {
                supabase_1.default
                    .channel("onMessage")
                    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, async (payload) => {
                    const messageData = payload.new;
                    const { data, status } = await (0, chatroom_1.getChatroomUsersFromID)(messageData.chatroom_id);
                    if (status === "error" || !data) {
                        supabase_1.default.channel("onMessage").unsubscribe();
                        return;
                    }
                    for (const reciever of data) {
                        const { is_active, user_id } = reciever;
                        io.to(user_id).emit("onMessage", {
                            channel: "onMessage",
                            data: { message: messageData, shouldActivate: !is_active, user_id },
                        });
                    }
                })
                    .subscribe();
            }
            catch (error) {
                console.log(error);
            }
        });
        socket.on("disconnect", () => {
            console.log("A user disconnected");
            supabase_1.default.channel("onMessage").unsubscribe();
        });
    });
};
exports.initSocket = initSocket;
//# sourceMappingURL=initSocket.js.map