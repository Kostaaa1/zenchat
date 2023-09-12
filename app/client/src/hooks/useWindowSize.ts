import { useEffect, useState } from "react";

type TWindowSize = {
  width: number;
  height: number;
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<TWindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleWindowSize);

    return () => {
      window.removeEventListener("resize", handleWindowSize);
    };
  }, []);

  return windowSize;
};

export default useWindowSize;
