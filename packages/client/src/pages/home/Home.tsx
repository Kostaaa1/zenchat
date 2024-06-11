import MainContainer from "../../components/MainContainer";
import useGeneralStore from "../../lib/stores/generalStore";
import { cn } from "../../utils/utils";

const Home = () => {
  const isMobile = useGeneralStore((state) => state.isMobile);
  return (
    <MainContainer>
      <div
        className={cn(
          "ml-[80px] min-h-full w-full max-w-[1000px] px-4 py-2 lg:ml-[300px]",
          isMobile ? "ml-0" : "",
        )}
      >
        Home: this page is empty
      </div>
    </MainContainer>
  );
};

export default Home;
