import { trpc } from "../lib/trpcClient";
import useGeneralStore from "../lib/stores/generalStore";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const useUser = () => {
  const username = useGeneralStore((state) => state.username);
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  const ctx = trpc.useUtils();
  const userData = ctx.user.get.getData({
    data: username!,
    type: "username",
  });

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken();
      setToken(fetchedToken);
    };
    fetchToken();
  }, []);

  return {
    userData,
    token,
  };
};

export default useUser;
