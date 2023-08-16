import { icons } from "lucide-react";
import { FC } from "react";

type IconProps = {
  className?: string;
  name: keyof typeof icons;
  color?: string;
  size: string;
};

const Icon: FC<IconProps> = ({ className, name, size }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    return null;
  }

  return (
    <div className="transition-transform cursor-pointer duration-100 transform group-hover:scale-[1.03] group-active:scale-100">
      <LucideIcon className={className} id="icon" size={size} />
    </div>
  );
};

export default Icon;
