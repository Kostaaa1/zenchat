import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Header from "./pages/main/Header";
import Chat from "./pages/chat/Chat";
import Dashboard from "./pages/dashboard/Dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useStore from "./utils/store";
import { useEffect } from "react";

const { VITE_APP_CLERK_PUBLISHABLE_KEY } = import.meta.env;
if (!VITE_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
const clerkPubKey = VITE_APP_CLERK_PUBLISHABLE_KEY;

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();
  // const location = useLocation();
  // const { setIsSearchActive, setCurrentActiveList } = useStore();

  // useEffect(() => {
  //   const path = location.pathname;
  //   setIsSearchActive(false);

  //   if (path === "/") {
  //     console.log("Current route: home");
  //     setCurrentActiveList("home");
  //   } else if (path === "inbox") {
  //     console.log("Current route: inbox");
  //     setCurrentActiveList("inbox");
  //   }
  // }, [location, navigate]);

  return (
    <ClerkProvider publishableKey={clerkPubKey} navigate={(to) => navigate(to)}>
      <div className="relative h-screen flex justify-center items-center">
        <SignedIn>
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
            <Route path="/inbox" element={<Chat />} />
            <Route path="/:userId" element={<Dashboard />} />
          </Routes>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </div>
    </ClerkProvider>
  );
}

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ClerkProviderWithRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
