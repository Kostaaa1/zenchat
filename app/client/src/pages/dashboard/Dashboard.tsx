import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import { FaUser } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { trpc, trpcVanilla } from "../../utils/trpcClient";
import useStore from "../../utils/stores/store";
import ErrorPage from "../ErrorPage";
import { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetChatRoomId = async () => {
    setIsLoading(true);

    if (!userData || !user) return;

    const path = await trpcVanilla.chat.getId.query({
      userId: userData.id,
      inspectedUserId: user?.id,
    });

    if (path) {
      setIsLoading(false);
      navigate(`/inbox/${path}`);
    }
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
      <div className="ml-16 flex w-full flex-col">
        <div className="flex h-20 flex-wrap">
          <h1 className="pr-8 text-2xl">{userData?.username}</h1>
          {username !== userData?.username ? (
            <Button
              isLoading={isLoading}
              buttonColor="blue"
              onClick={handleGetChatRoomId}
            >
              Message
            </Button>
          ) : (
            <Button> Edit Profile</Button>
          )}
        </div>
        <div>
          <h4 className="font-semibold">
            {userData?.first_name} {userData?.last_name}
          </h4>
          <span>Lorem ipsum dolor sit amet.</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const params = useParams<{ userId: string }>();
  const { userId } = params;
  const location = useLocation();
  const ctx = trpc.useContext();
  const { email } = useStore();
  const userData = ctx.user.getUser.getData(email);
  const [isIndexRoute, setIsIndexRoute] = useState<boolean>(true);

  useEffect(() => {
    location.pathname === "/" ? setIsIndexRoute(true) : setIsIndexRoute(false);
  }, [location.pathname]);

  const { data: inspectedUserData, isFetching } =
    trpc.user.getUserWithUsername.useQuery(userId, {
      enabled: !!userData && !!userId && userData.username !== userId,
      refetchOnWindowFocus: false,
    });

  return (
    <>
      <div className="ml-80 flex h-full w-full max-w-[900px] flex-col px-4">
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
                  username={userData?.username}
                  userData={
                    isIndexRoute || userData?.username === userId
                      ? userData
                      : inspectedUserData
                  }
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
