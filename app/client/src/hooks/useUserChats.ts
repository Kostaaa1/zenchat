import useUser from "./useUser";
// import { TChatRoomData, TMessage } from "../types/types";
import { trpc, trpcVanilla } from "../utils/trpcClient";
import { TMessage } from "../../../server/src/types/types";
import { useEffect } from "react";

const useUserChats = () => {
  const { userData } = useUser();
};

export default useUserChats;
