import useStore from "../utils/stores/store";
import { trpc } from "../utils/trpcClient";

const useUser = () => {
  const { email } = useStore();
  const ctx = trpc.useContext();
  const userData = ctx.user.getUser.getData({ data: email, type: "email" });

  return {
    userData,
    ctx,
  };
};

export default useUser;
