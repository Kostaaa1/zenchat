import { useEffect, RefObject, useCallback } from "react";

const useOutsideClick = (
  refs: RefObject<HTMLElement>[],
  event: "mousedown" | "click",
  callback: () => void,
) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        refs
          .filter((r) => Boolean(r.current))
          .every((r) => r.current && !r.current.contains(target))
      )
        callback();
    },
    [callback, refs],
  );
  useEffect(() => {
    window.addEventListener(event, handleClick as EventListener);
    return () => {
      window.removeEventListener(event, handleClick as EventListener);
    };
  }, [event, handleClick]);
};

export default useOutsideClick;
