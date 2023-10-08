import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
  useUser,
} from "@clerk/clerk-react";
import { Route, Routes } from "react-router-dom";
import Header from "./pages/main/Header";
import Inbox from "./pages/chat/Inbox";
import Dashboard from "./pages/dashboard/Dashboard";
import LoadingPage from "./pages/LoadingPage";
import Modals from "./components/Modals";
import { trpc } from "./utils/trpcClient";
import useStore from "./utils/stores/store";
import { useEffect } from "react";

function App() {
  const { user } = useUser();
  const { email, setEmail, setUserId } = useStore();
  const ctx = trpc.useContext();

  const { data: userData, isFetched } = trpc.user.get.useQuery(
    { data: email, type: "email" },
    { enabled: !!email && email.length > 0 && email !== "" },
  );

  const createUserMutation = trpc.user.create.useMutation({
    mutationKey: [email],
    onSuccess: (data) => {
      ctx.user.get.setData({ data: email, type: "email" }, data);
    },
  });

  const createUser = async () => {
    if (!user) return;
    const { firstName, lastName, username } = user;

    await createUserMutation
      .mutateAsync({
        firstName,
        lastName,
        username,
        email,
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (userData === null) {
      createUser();
      return;
    }

    if (userData) setUserId(userData.id);
  }, [userData]);

  useEffect(() => {
    if (!user) return;
    const userEmailAddress = user?.emailAddresses?.[0]?.emailAddress;
    setEmail(userEmailAddress);
  }, [user]);

  return (
    <>
      <SignedIn>
        {!isFetched ? (
          <LoadingPage />
        ) : (
          <div className="relative flex h-screen items-center justify-center">
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
