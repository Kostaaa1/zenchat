import { useEffect, useState } from "react";
import useGeneralStore from "../utils/state/generalStore";
import useSearchStore from "../utils/state/searchStore";

type TWindowSize = {
  width: number;
  height: number;
};

const useWindowSize = () => {
  const { pathname } = location;
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  const [windowSize, setWindowSize] = useState<TWindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { setIsMobile, setIsResponsive } = useGeneralStore(
    (state) => state.actions,
  );

  const handleWindowSize = () => {
    const { innerWidth } = window;
    setIsMobile(innerWidth <= 768);
    setWindowSize({ width: innerWidth, height: window.innerHeight });
    setIsResponsive(
      pathname.includes("/inbox") || innerWidth <= 1024 || isSearchActive,
    );
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
