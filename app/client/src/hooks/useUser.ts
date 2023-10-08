import { trpc } from "../utils/trpcClient";
import useStore from "../utils/stores/store";

const useUser = () => {
  const { userId, email } = useStore();
  const userData = trpc
    .useContext()
    .user.get.getData({ data: email, type: "email" });

  return {
    userData,
    email,
    userId,
  };
};

export default useUser;
