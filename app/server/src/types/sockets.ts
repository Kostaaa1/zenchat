import { TMessage } from "./types";

export type MessagesChannelData = {
  channel: "onMessage";
  data: {
    message: TMessage;
    shouldActivate: boolean;
    user_id: string;
  };
};

export type TypingChannelData = {
  channel: "isTyping";
  data: boolean;
};

export type TRecieveNewSocketMessageType = MessagesChannelData | TypingChannelData;
