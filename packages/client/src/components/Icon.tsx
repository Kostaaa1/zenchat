import { icons } from "lucide-react"
import { FC } from "react"

type IconProps = {
  className?: string
  name: keyof typeof icons
  color?: string
  size?: string
  strokeWidth?: string
  onClick?: () => void
}

const Icon: FC<IconProps> = ({ onClick, strokeWidth, className, name, size }) => {
  const LucideIcon = icons[name]
  if (!LucideIcon) return null

  return (
    <div
      onClick={onClick}
      className="duration-50 group-hover:scale-10 transform cursor-pointer transition-transform group-active:scale-90"
    >
      <LucideIcon strokeWidth={strokeWidth ? strokeWidth : "2"} className={className} id="icon" size={size} />
    </div>
  )
}

export default Icon
