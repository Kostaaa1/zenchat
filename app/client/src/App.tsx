import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
  useUser,
  useAuth,
} from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./pages/main/Header";
import Inbox from "./pages/chat/Inbox";
import Dashboard from "./pages/dashboard/Dashboard";
import LoadingPage from "./pages/LoadingPage";
import Modals from "./components/modals/Modals";
import { trpc } from "./utils/trpcClient";
import { useEffect, useState } from "react";
import { loadImage } from "./utils/utils";
import { TPost } from "../../server/src/types/types";
import useModalStore from "./utils/stores/modalStore";
import useGeneralStore from "./utils/stores/generalStore";

function App() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const ctx = trpc.useUtils();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const isModalOpen = useModalStore((state) => state.isModalOpen);
  const username = useGeneralStore((state) => state.username);
  const { setUsername } = useGeneralStore((state) => state.actions);

  useEffect(() => {
    if (!user || !user.username) return;
    setUsername(user?.username);
  }, [user]);

  const { data: userData } = trpc.user.get.useQuery(
    { data: username!, type: "username" },
    { enabled: !!user && !!username && !!isSignedIn },
  );

  const createUserMutation = trpc.user.create.useMutation({
    mutationKey: [username],
    onSuccess: (data) => {
      ctx.user.get.setData(
        { data: userData!.username, type: "username" },
        data,
      );
    },
  });

  const createUser = async () => {
    if (!user) return;
    const { firstName, lastName } = user;
    await createUserMutation
      .mutateAsync({
        firstName,
        lastName,
        username: user.username,
        email: user.emailAddresses[0].emailAddress,
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadImages = async (posts: TPost[]) => {
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
          <div
            style={{ overflow: !isModalOpen ? "hidden" : "auto" }}
            className="relative flex h-screen w-full justify-center"
          >
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
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/inbox/:chatRoomId" element={<Inbox />} />
              <Route path="/:username" element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
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
