import { useEffect, useState } from "react";
import useSearchStore from "../lib/stores/searchStore";
import useGeneralStore from "../lib/stores/generalStore";

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
  }, []);

  return windowSize;
};

export default useWindowSize;
