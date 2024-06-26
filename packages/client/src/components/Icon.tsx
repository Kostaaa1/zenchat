import { LucideIcon, icons } from "lucide-react"
import { ComponentProps, FC } from "react"

type IconProps = {
  name: keyof typeof icons
  onClick?: () => void
} & ComponentProps<LucideIcon>

const Icon: FC<IconProps> = ({ name, onClick, ...props }) => {
  const LucideIcon = icons[name]
  if (!LucideIcon) return null

  return (
    <div
      onClick={onClick}
      className="duration-50 group-hover:scale-10 transform cursor-pointer transition-transform group-active:scale-90"
    >
      <LucideIcon id="icon" {...props} strokeWidth={props.strokeWidth ? props.strokeWidth : "2"} />
    </div>
  )
}

export default Icon
