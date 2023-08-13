import { useUser } from "@clerk/clerk-react";
import { icons } from "lucide-react";
import React, { FC, useEffect } from "react";
import { SiZend } from "react-icons/si";

interface NavbarProps {}

type IconProps = {
  name: keyof typeof icons;
  color: string;
  size: string;
};

const Icon: React.FC<IconProps> = ({ name, color, size }) => {
  const LucideIcon = icons[name];
  if (!LucideIcon) {
    return null; // Handle the case where the icon is not found
  }

  return <LucideIcon color={color} size={size} />;
};

const Navbar: FC<NavbarProps> = () => {
  const { user } = useUser();

  return (
    <nav className="w-[70px] h-full py-5 flex justify-between items-center flex-col">
      <span className="rotate-30 p-[10px] transition-colors duration-200 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg">
        <SiZend className="w-[28px] h-[28px]" />
      </span>
      <ul className="border my-4 py-4 h-full w-full flex items-center flex-col">
        <li className="p-[10px] mb-4 transition-colors duration-200 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg">
          <Icon name="MessageCircle" color="white" size="28px" />
        </li>
        <li className="p-[10px] mb-4 transition-colors duration-200 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg">
          <Icon name="Search" color="white" size="28px" />
        </li>
        <li className="p-[10px] mb-4 transition-colors duration-200 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg">
          <img src={user?.imageUrl} className="w-7 h-7 rounded-full border-2" />
        </li>
      </ul>
      <span className="p-[10px] transition-colors duration-200 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg">
        <Icon name="Menu" color="white" size="28px" />
      </span>
    </nav>
  );
};

export default Navbar;
