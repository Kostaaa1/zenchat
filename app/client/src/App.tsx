import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
  useUser,
  useAuth,
} from "@clerk/clerk-react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Header from "./pages/main/Header";
import Inbox from "./pages/chat/Inbox";
import Dashboard from "./pages/dashboard/Dashboard";
import LoadingPage from "./pages/LoadingPage";
import Modals from "./components/modals/Modals";
import { trpc } from "./utils/trpcClient";
import { useEffect, useState } from "react";
import { loadImage } from "./utils/utils";
import useGeneralStore from "./utils/stores/generalStore";
import Home from "./pages/Home";
import { Tables } from "../../server/src/types/supabase";
import io from "socket.io-client";
import useChatCache from "./hooks/useChatCache";
import useChatSocket from "./hooks/useChatSocket";
const socket = io(import.meta.env.VITE_SERVER_URL);

function App() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const ctx = trpc.useUtils();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const username = useGeneralStore((state) => state.username);
  const { setUsername } = useGeneralStore((state) => state.actions);
  const navigate = useNavigate();
  const { recieveNewSocketMessage } = useChatCache();
  useChatSocket({ socket, recieveNewSocketMessage });

  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
  }, [user]);

  const { data: userData } = trpc.user.get.useQuery(
    { data: username!, type: "username" },
    { enabled: !!user && !!username && !!isSignedIn },
  );

  const createUserMutation = trpc.user.create.useMutation({
    mutationKey: [username],
    onSuccess: (data) => {
      if (!data || !user?.username) return;
      ctx.user.get.setData({ data: user.username, type: "username" }, data);
    },
  });

  const createUser = async () => {
    if (!user) return;
    const { firstName, lastName, username } = user;
    if (!firstName || !lastName || !username) throw new Error("No credentials");

    await createUserMutation
      .mutateAsync({
        firstName,
        lastName,
        username,
        email: user.emailAddresses[0].emailAddress,
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadImages = async (posts: Tables<"posts">[]) => {
    await Promise.all(posts.map(async (x) => await loadImage(x.media_url)));
    setIsFetched(true);
  };

  useEffect(() => {
    if (userData === null) createUser();
    if (userData) loadImages(userData.posts);
  }, [userData]);

  return (
    <>
      <SignedIn>
        {!isFetched ? (
          <LoadingPage />
        ) : (
          <div className="relative flex h-screen w-full justify-center overflow-auto">
            <Header />
            <Routes>
              <Route
                path="/sign-in/*"
                element={<SignIn routing="path" path="/sign-in" />}
              />
              <Route
                path="/sign-up/*"
                element={<SignUp routing="path" path="/sign-up" />}
              />
              <Route path="/" element={<Home />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/inbox/:chatRoomId" element={<Inbox />} />
              <Route path="/:username" element={<Dashboard />} />
            </Routes>
            <Modals />
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default App;
