import { useEffect } from "react";
import useStore, { IUserData } from "../../utils/stores/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../../../lib/supabaseClient";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import useCachedUser from "../../hooks/useCachedUser";

const Dashboard = () => {
  const { setIsSearchActive } = useStore();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useCachedUser();

  const getInspectedUserData = async () => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("username", params.userId);

      if (!data) {
        console.log("Inspect user data hasn't been found");
      }
      return data?.[0] as IUserData;
    } catch (error) {
      console.error(error);
    }
  };

  const { data: inspectedUserData, isLoading } = useQuery(
    ["inspected-user", params.userId],
    getInspectedUserData,
    {
      refetchOnMount: "always",
    },
  );

  const createChatRoom = async (): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from("chatrooms")
        .insert({ last_message: "" })
        .select("id");

      if (error) {
        console.log(error.message);
        return null;
      }

      return data?.[0].id || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const insertChatroomUser = async (
    chatroomId: number,
    userId: string,
  ): Promise<void> => {
    await supabase
      .from("chatroom_users")
      .insert({ chatroom_id: chatroomId, user_id: userId });
  };

  const getChatRoomId = async (): Promise<void> => {
    try {
      if (!userData || !inspectedUserData) return;

      const [userData1, userData2] = await Promise.all([
        supabase
          .from("chatroom_users")
          .select("chatroom_id")
          .eq("user_id", userData.id),
        supabase
          .from("chatroom_users")
          .select("chatroom_id")
          .eq("user_id", inspectedUserData.id),
      ]);

      const finalData1 = userData1?.data;
      const finalData2 = userData2?.data;

      console.log(finalData1);
      console.log(finalData2);

      if (!finalData1?.length || !finalData2?.length) {
        const chatroomId = await createChatRoom();
        if (chatroomId) {
          await insertChatroomUser(chatroomId, userData.id);
          await insertChatroomUser(chatroomId, inspectedUserData.id);
          const path = `/inbox/${chatroomId}`;
          navigate(path);
        }
      } else {
        const path = `/inbox/${finalData1?.[0]?.chatroom_id}`;
        navigate(path);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="ml-80 h-full w-[900px] max-w-full px-4">
          <div className="flex border-b border-[#262626] px-16 py-8">
            <img
              src={inspectedUserData?.image_url}
              className="h-40 w-40 rounded-full"
              alt="user-image"
            />
            <div className="ml-24 flex w-full flex-col">
              <div className="mb-6 flex">
                <h1 className="mr-8 text-2xl">{inspectedUserData?.username}</h1>
                {location.pathname.slice(1) !== userData?.username && (
                  <Button buttonColor="blue" onClick={() => getChatRoomId()}>
                    Message
                  </Button>
                )}
              </div>
              <div>
                <h4 className="">
                  {inspectedUserData?.first_name} {inspectedUserData?.last_name}
                </h4>
                <span>Lorem ipsum dolor sit amet.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
