import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { FaUser } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { trpc, trpcVanilla } from "../../utils/trpcClient";
import useStore from "../../utils/stores/store";
import ErrorPage from "../ErrorPage";
import { useContext, useEffect, useState } from "react";
import { TUserData } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";

const UserDashboardComponent = ({
  userData,
  username,
}: {
  userData: TUserData | undefined | null;
  username: string | undefined;
}) => {
  const navigate = useNavigate();
  const { userData: user } = useUser();

  const handleGetChatRoomId = async () => {
    if (!userData || !user) return;

    const path = await trpcVanilla.chat.getId.query({
      userId: userData.id,
      inspectedUserId: user?.id,
    });
    if (path) navigate(`/inbox/${path}`);
  };

  return (
    <div className="mx-16 my-8 flex h-full max-h-[160px]">
      <div>
        {userData?.image_url === "" ? (
          <FaUser className="h-full w-[160px] rounded-full bg-[#c24425] p-4" />
        ) : (
          <img
            src={userData?.image_url}
            className="h-full w-full max-w-[160px] rounded-full"
            alt="user-image"
          />
        )}
      </div>
      <div className="ml-24 flex w-full flex-col">
        <div className="mb-6 flex">
          <h1 className="mr-8 text-2xl">{userData?.username}</h1>
          {username !== userData?.username && (
            <Button buttonColor="blue" onClick={handleGetChatRoomId}>
              Message
            </Button>
          )}
        </div>
        <div>
          <h4>
            {userData?.first_name} {userData?.last_name}
          </h4>
          <span>Lorem ipsum dolor sit amet.</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const params = useParams();
  const location = useLocation();
  const ctx = trpc.useContext();
  const { email } = useStore();
  const userData = ctx.user.getUser.getData(email);
  const [isIndexRoute] = useState<boolean>(location.pathname === "/");

  const { data: inspectedUserData, isFetching } =
    trpc.user.getUserWithUsername.useQuery(params.userId, {
      enabled:
        !!userData && !!params.userId && userData.username !== params.userId,
      refetchOnWindowFocus: false,
    });

  useEffect(() => {
    console.log(inspectedUserData);
  }, [inspectedUserData]);

  return (
    <>
      <div className="ml-80 flex h-full w-[900px] max-w-full flex-col px-4">
        {inspectedUserData === null ? (
          <ErrorPage />
        ) : (
          <>
            {isFetching && !isIndexRoute ? (
              <div className="mt-10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            ) : (
              <>
                <UserDashboardComponent
                  userData={
                    isIndexRoute || userData?.username === params.userId
                      ? userData
                      : inspectedUserData
                  }
                  username={userData?.username}
                />
                <div className="h-full border-t border-[#262626]"></div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
