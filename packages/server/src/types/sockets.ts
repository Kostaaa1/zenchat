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

// type RTCIceCandidateSignal = {
//   type: "ice";
//   candidate: RTCIceCandidate;
// };
// type RTCOfferSignal = {
//   type: "offer";
//   offer: RTCSessionDescriptionInit;
// };
// type RTCAnswerSignal = {
//   type: "answer";
//   answer: RTCSessionDescriptionInit;
// };
// export type RTCSignals = (RTCIceCandidateSignal | RTCOfferSignal | RTCAnswerSignal) & {
//   chatroomId: string;
//   receivers: string[];
//   caller: string;
// };

export type SocketStatus = "success" | "error";
export type RTCSignal = {
  type: "offer" | "answer" | "ice";
};
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
    receivers: string[];
    candidate: RTCIceCandidate;
    caller: string;
  };
};

type CallStatus = "initiated" | "declined" | "accepted" | "hangup";
export type SocketCallPayload = {
  status: CallStatus;
  chatroomId: string;
  receivers: string[];
  caller: {
    id: string;
    username: string;
    image_url: string | null;
  };
};
