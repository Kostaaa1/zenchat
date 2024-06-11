import { FC, RefObject } from "react";
import Picker from "@emoji-mart/react";
import { AnimatePresence, motion } from "framer-motion";
import data from "@emoji-mart/data";
import useChat from "../../../hooks/useChat";

type EmojiPickerProps = {
  showEmojiPicker: boolean;
  emojiRef: RefObject<HTMLDivElement>;
};

export const EmojiPickerContainer: FC<EmojiPickerProps> = ({
  showEmojiPicker,
  emojiRef,
}) => {
  const { handleSelectEmoji } = useChat();
  return (
    <AnimatePresence>
      {showEmojiPicker ? (
        <motion.div
          ref={emojiRef}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute bottom-20 left-4 z-50"
        >
          <Picker theme="dark" data={data} />
          <Picker theme="dark" data={data} onEmojiSelect={handleSelectEmoji} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
