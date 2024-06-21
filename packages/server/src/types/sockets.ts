import { TMessage } from "./types";

export type MessagesChannelData = {
  channel: "onMessage";
  data: {
    message: TMessage;
    shouldActivate: boolean;
    user_id: string;
  };
};
export type TReceiveNewSocketMessageType = MessagesChannelData;

type CallType = "initiated" | "declined" | "accepted" | "hangup";
export type SocketCallPayload = {
  type: CallType;
  chatroomId: string;
  participants: string[];
  caller: {
    id: string;
    username: string;
    image_url: string | null;
  };
};
