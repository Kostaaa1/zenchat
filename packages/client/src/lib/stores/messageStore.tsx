// import { create } from "zustand";
// import { TMessage } from "../../../../server/src/types/types";

// type MessageStore = {
//   shouldFetchMoreMessages: boolean;
//   // messages: TMessage[];
//   areMessagesLoading: boolean;
//   actions: {
//     setAreMessagesLoading: (l: boolean) => void;
//     setShouldFetchMoreMessages: (val: boolean) => void;
//     // setMessages: (messages: TMessage[]) => void;
//     // removeMessage: (id: string) => void;
//     // addMessage: (msg: TMessage) => void;
//   };
// };

// const useMessageStore = create<MessageStore>(
//   (set): MessageStore => ({
//     shouldFetchMoreMessages: true,
//     // messages: [],
//     areMessagesLoading: true,
//     // actions: {
//       // setAreMessagesLoading: (l: boolean) => set({ areMessagesLoading: l }),
//       // setShouldFetchMoreMessages: (val: boolean) =>
//       //   set({ shouldFetchMoreMessages: val }),
//       // setMessages: (messages: TMessage[]) => set({ messages }),
//       // removeMessage: (id: string) =>
//       //   set((state) => ({
//       //     messages: state.messages.filter((msg) => msg.id !== id),
//       //   })),
//       // addMessage: (msg: TMessage) =>
//       //   set((state) => ({ messages: [...state.messages, msg] })),
//     // },
//   }),
// );

// export default useMessageStore;
