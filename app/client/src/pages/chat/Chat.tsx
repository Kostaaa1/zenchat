import React, { FC } from "react";
import Icon from "../main/components/Icon";
import Button from "../../components/Button";
import { cn } from "../../utils/utils";
import Avatar from "../../components/Avatar";
import { TChatRoomData, TMessage } from "../../../../server/src/types/types";
import { Loader2 } from "lucide-react";

type ChatProps = {
  chatRoomId?: string;
  // activeChatroomData: TChatRoomData;
  scrollRef: React.RefObject<HTMLDivElement>;
  messages: TMessage[] | undefined;
  username: string | undefined;
  user_id: string | undefined;
  image_url: string | undefined;
  isLoading: boolean;
  // isRefetching: boolean;
};

const Chat: FC<ChatProps> = ({
  scrollRef,
  image_url,
  messages,
  user_id,
  username,
  isLoading,
  // isRefetching,
}) => {
  // const { image_url, username, messages, user_id } = activeChatroomData;

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex h-full flex-col-reverse justify-between overflow-y-scroll"
        >
          <ul className="flex flex-col-reverse p-3 ">
            {messages?.map((message, id) => (
              <li
                className={cn(
                  "mt-2 flex w-full",
                  message.sender_id === user_id
                    ? "justify-end self-end"
                    : "justify-start self-start",
                )}
                key={id}
              >
                <div
                  className={`rounded-xl p-3 py-2 ${
                    message.sender_id === user_id
                      ? "bg-[#356ed0]"
                      : "bg-neutral-800"
                  }`}
                >
                  {message.content}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-center pb-8 pt-4">
            <Avatar image_url={image_url} size="xl" />
            <h1 className="my-2 text-xl font-semibold">{username}</h1>
            <Button>View profile</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
