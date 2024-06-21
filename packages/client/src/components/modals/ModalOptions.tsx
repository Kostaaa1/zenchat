import { FC, ReactNode, forwardRef } from "react"
import { Modal } from "./Modals"
import useModalStore from "../../stores/modalStore"
import { cn } from "../../utils/utils"

type ListProps = {
  children: ReactNode
  onClick?: () => void
  className?: string
}

const List: FC<ListProps> = ({ onClick, className, children }) => {
  return (
    <li
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer bg-white bg-opacity-0 py-2 text-center font-semibold duration-100 hover:bg-opacity-[0.05]",
        className
      )}
    >
      {children}
    </li>
  )
}

const ModalOptions = forwardRef<HTMLUListElement>((_, ref) => {
  const options = useModalStore((state) => state.options)
  return (
    <Modal>
      <ul ref={ref} className="h-max w-[90vw] max-w-[320px] rounded-lg bg-neutral-800">
        {options.map(({ condition, id, child, className, onClick }) => (
          <div key={id}>
            {condition && (
              <List className={className} onClick={onClick}>
                {child}
              </List>
            )}
          </div>
        ))}
      </ul>
    </Modal>
  )
})

export default ModalOptions
