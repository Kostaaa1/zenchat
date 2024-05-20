import { FC, forwardRef } from "react";
import { Modal } from "./Modals";
import { cn } from "../../utils/utils";
import useModals from "./hooks/useModals";

type ListProps = {
  text: string;
  onClick: () => void;
  className?: string;
};

const List: FC<ListProps> = ({ text, onClick, className }) => {
  return (
    <li
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer bg-white bg-opacity-0 py-2 text-center font-semibold duration-100 hover:bg-opacity-[0.05]",
        className,
      )}
    >
      {text}
    </li>
  );
};

const ModalOptions = forwardRef<HTMLUListElement>((_, ref) => {
  const { modalOptionsData } = useModals();
  return (
    <Modal>
      <ul ref={ref} className="h-max w-[380px] rounded-lg bg-neutral-800">
        {modalOptionsData.POST.map(({ className, fn, id, text }) => (
          <List key={id} text={text} onClick={fn} className={className} />
        ))}
      </ul>
    </Modal>
  );
});

export default ModalOptions;
