import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, useNavigate } from "react-router-dom";

import { ClerkProvider } from "@clerk/clerk-react";
import TRPCWrapper from "./TRPCWrapper";

const { VITE_APP_CLERK_PUBLISHABLE_KEY } = import.meta.env;
if (!VITE_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
const clerkPubKey = VITE_APP_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      navigate={(to: string) => {
        const navigate = useNavigate();
        navigate(to);
      }}
    >
      <TRPCWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TRPCWrapper>
    </ClerkProvider>
  </React.StrictMode>,
);
