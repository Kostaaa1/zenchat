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

type RTCIceCandidateSignal = {
  type: "ice";
  candidate: RTCIceCandidate;
};
type RTCOfferSignal = {
  type: "offer";
  offer: RTCSessionDescriptionInit;
};
type RTCAnswerSignal = {
  type: "answer";
  answer: RTCSessionDescriptionInit;
};
export type RTCSignals = (RTCIceCandidateSignal | RTCOfferSignal | RTCAnswerSignal) & {
  chatroomId: string;
  receivers: string[];
  caller: string;
};

type CallType = "initiated" | "declined" | "accepted" | "hangup";
export type SocketCallPayload = {
  type: CallType;
  chatroomId: string;
  receivers: string[];
  caller: {
    id: string;
    username: string;
    image_url: string | null;
  };
};
