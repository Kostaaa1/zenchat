"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = exports.rooms = void 0;
const supabase_1 = __importDefault(require("./supabase"));
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
        // socket.on(
        //   "isTyping",
        //   (data: {
        //     isTyping: boolean;
        //     users: { id: string; isTyping: boolean; typingUser: string }[];
        //   }) => {
        //     for (const user of data.users) {
        //       if (data.isTyping) {
        //         io.to(user.id).emit("isTyping", { channel: "isTyping", data: user });
        //       } else {
        //         io.to(user.id).emit("isTyping", null);
        //       }
        //     }
        //   }
        // );
        socket.on("onMessage", () => {
            try {
                supabase_1.default
                    .channel("onMessage")
                    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, async (payload) => {
                    const messageData = payload.new;
                    const { data, error } = await supabase_1.default
                        .from("chatroom_users")
                        .select("user_id, is_active")
                        .eq("chatroom_id", messageData.chatroom_id);
                    if (error || !data) {
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