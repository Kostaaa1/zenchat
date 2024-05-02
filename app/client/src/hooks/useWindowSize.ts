import { useEffect, useState } from "react";
import useGeneralStore from "../utils/stores/generalStore";

type TWindowSize = {
  width: number;
  height: number;
};

const useWindowSize = () => {
  const { setIsMobile, setIsResponsive } = useGeneralStore(
    (state) => state.actions,
  );
  const [windowSize, setWindowSize] = useState<TWindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleWindowSize = () => {
      const { innerWidth } = window;
      setIsMobile(innerWidth <= 768);
      setIsResponsive(innerWidth <= 1024);
      setWindowSize({ width: innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleWindowSize);
    return () => {
      window.removeEventListener("resize", handleWindowSize);
    };
  }, []);

  return windowSize;
};

export default useWindowSize;
