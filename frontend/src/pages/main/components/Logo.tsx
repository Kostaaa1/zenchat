import { SiZend } from "react-icons/si";
import ListItem from "./ListItem";
import { FC } from "react";

type LogoProps = {
  head?: string;
};

const Logo: FC<LogoProps> = ({ head }) => {
  return (
    <ListItem head={head} hover="blank" variant="list">
      <div>
        <SiZend className="w-[24px] h-[24px] rotate-90" />
      </div>
    </ListItem>
  );
};

export default Logo;
