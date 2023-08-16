import { SiZend } from "react-icons/si";
import ListItem from "./ListItem";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

type LogoProps = {
  variant: "default" | "list";
};

const Logo: FC<LogoProps> = ({ variant }) => {
  const navigate = useNavigate();
  return (
    <div>
      <ListItem
        onClick={() => navigate("/")}
        head={variant === "default" ? "" : "Zenchat"}
        hover="blank"
        variant={variant}
      >
        <div>
          <SiZend className="w-[28px] h-[28px] rotate-90" />
        </div>
      </ListItem>
    </div>
  );
};

export default Logo;
