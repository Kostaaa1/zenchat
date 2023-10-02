import { FC, RefObject } from "react";
import Picker from "@emoji-mart/react";
import { AnimatePresence, motion } from "framer-motion";
import data, { Skin } from "@emoji-mart/data";

type EmojiPickerProps = {
  showEmojiPicker: boolean;
  emojiRef: RefObject<HTMLDivElement>;
  handleSelectEmoji: (e: Skin, msg: string) => void;
};

export const EmojiPickerContainer: FC<EmojiPickerProps> = ({
  showEmojiPicker,
  emojiRef,
  handleSelectEmoji,
}) => {
  return (
    <AnimatePresence>
      {showEmojiPicker ? (
        <motion.div
          ref={emojiRef}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute bottom-24 left-[540px]"
        >
          <Picker theme="dark" data={data} onEmojiSelect={handleSelectEmoji} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
