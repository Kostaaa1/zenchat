import { useEffect, useState } from "react";
import useGeneralStore from "../utils/state/generalStore";
import useSearchStore from "../utils/state/searchStore";

type TWindowSize = {
  width: number;
  height: number;
};

const useWindowSize = () => {
  const { pathname } = location;
  const { setIsMobile, setIsResponsive } = useGeneralStore(
    (state) => state.actions,
  );
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  const [windowSize, setWindowSize] = useState<TWindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleWindowSize = () => {
    const { innerWidth } = window;
    setIsMobile(innerWidth <= 768);
    setIsResponsive(
      isSearchActive || pathname.includes("/inbox") || innerWidth <= 1024,
    );
    setWindowSize({ width: innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    handleWindowSize();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleWindowSize);
    window.addEventListener("load", handleWindowSize);
    return () => {
      window.removeEventListener("resize", handleWindowSize);
      window.removeEventListener("load", handleWindowSize);
    };
  }, [isSearchActive, pathname]);

  return windowSize;
};

export default useWindowSize;
