import useUserChats from "./useUserChats";
import { useParams } from "react-router-dom";
import { TChatRoomData, TMessage } from "../../../server/src/types/types";
import { trpc, trpcVanilla } from "../utils/trpcClient";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

const useChatRoom = () => {
  const params = useParams();
};

export default useChatRoom;
