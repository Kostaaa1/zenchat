import { useEffect, RefObject, useCallback } from "react";

const useOutsideClick = (
  refs: RefObject<HTMLElement>[],
  callback: () => void,
) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (refs.find((ref) => !ref.current)) return;

      const isOutslideClick = refs.every(
        (ref) => ref.current && !ref.current.contains(e.target as Node),
      );

      if (isOutslideClick) {
        callback();
      }
    },
    [callback, refs],
  );

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);
};

export default useOutsideClick;
