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

// WebRTC
export type SocketStatus = "success" | "error";
export type RTCOfferResponse = {
  status: SocketStatus;
  message: {
    chatroomId: string;
    receivers: string[];
    caller: string;
    offer: any;
  };
};

export type RTCAnswerResponse = {
  status: SocketStatus;
  message: {
    chatroomId: string;
    receivers: string[];
    caller: string;
    answer: any;
  };
};

export type RTCIceCandidateResponse = {
  status: SocketStatus;
  message: {
    candidate: RTCIceCandidate;
    caller: string;
    receivers: string[];
  };
};

type CallStatus = "initiated" | "declined" | "accepted" | "hangup";

export type SocketCallPayload = {
  chatroomId: string;
  status: CallStatus;
  receivers: string[];
  caller: {
    id: string;
    username: string;
    image_url: string | null;
  };
};
