import useGeneralStore from "../utils/stores/generalStore";
import { cn } from "../utils/utils";

const Home = () => {
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  return (
    <div
      className={cn(
        "min-h-full w-full max-w-[1000px] px-4 py-2",
        !isResponsive ? "ml-[300px]" : "ml-[80px]",
      )}
    ></div>
  );
};

export default Home;
