import { TMessage } from "./types";

type TTypingData = {
  userId: string;
  chatroom_id: string;
};

export type MessagesChannelData = {
  channel: "messages-channel";
  data: TMessage;
};

export type TypingChannelData = {
  channel: "typing";
  data: TTypingData;
};

export type TRecieveNewSocketMessageType =
  | MessagesChannelData
  | TypingChannelData;
