import MainContainer from "../components/MainContainer";
import useGeneralStore from "../stores/generalStore";
import { cn } from "../utils/utils";

const ErrorPage = () => {
  const isMobile = useGeneralStore((state) => state.isMobile);
  return (
    <MainContainer>
      {/* <div className="ml-[80px] flex w-full max-w-full flex-col flex-wrap items-center justify-center space-y-1 py-8 text-center"> */}

      <div
        className={cn(
          "ml-[80px] flex min-h-full w-full max-w-[1000px] flex-wrap items-center justify-center px-4 py-8 text-center lg:ml-[300px]",
          isMobile ? "ml-0" : "",
        )}
      >
        <h3 className="text-2xl font-semibold">
          Sorry, this page isn't available.
        </h3>
        <p>
          The link you followed may be broken, or the page may have been
          removed. Go back to main page.
        </p>
      </div>
    </MainContainer>
  );
};

export default ErrorPage;
