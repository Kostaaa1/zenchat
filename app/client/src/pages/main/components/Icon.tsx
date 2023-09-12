import { icons } from "lucide-react";
import { FC } from "react";

type IconProps = {
  className?: string;
  name: keyof typeof icons;
  color?: string;
  size?: string;
  onClick?: () => void;
};

const Icon: FC<IconProps> = ({ onClick, className, name, size }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className="duration-50 group-hover:scale-10 transform cursor-pointer transition-transform group-active:scale-100"
    >
      <LucideIcon className={className} id="icon" size={size} />
    </div>
  );
};

export default Icon;
