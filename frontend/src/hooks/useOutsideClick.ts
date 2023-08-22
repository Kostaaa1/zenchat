import { useEffect, RefObject, useCallback } from "react";

const useOutsideClick = (
  refs: RefObject<HTMLElement>[],
  callback: () => void
) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const isOUtslideClick = refs.every(
        (ref) => ref.current && !ref.current.contains(e.target as Node)
      );

      if (isOUtslideClick) {
        callback();
      }
    },
    [callback, refs]
  );

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);
};

export default useOutsideClick;
