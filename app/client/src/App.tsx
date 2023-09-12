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
import { trpc } from "./utils/trpcClient";
import { useEffect } from "react";
import useStore from "./utils/stores/store";

function App() {
  const { user } = useUser();
  const { email, setEmail, setUserId } = useStore();
  const ctx = trpc.useContext();

  const { data: userData, isFetched } = trpc.user.getUser.useQuery(email, {
    enabled: !!email,
  });

  const createUserMutation = trpc.user.createUser.useMutation({
    mutationKey: [email],
    onSuccess: (data) => {
      ctx.user.getUser.setData(email, data);
    },
  });

  useEffect(() => {
    if (userData) setUserId(userData.id);

    if (user?.emailAddresses?.[0]?.emailAddress) {
      setEmail(user.emailAddresses[0].emailAddress);
    }

    if (user && userData === null && email) {
      console.log("The user is not existing, creating it !");
      const { firstName, lastName, username } = user;

      createUserMutation
        .mutateAsync({
          firstName,
          lastName,
          username,
          email,
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [userData, user, email]);

  return (
    <div className="relative flex h-screen items-center justify-center">
      <SignedIn>
        {!isFetched ? (
          <LoadingPage />
        ) : (
          <>
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
              <Route path="/:userId" element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </>
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}

export default App;
