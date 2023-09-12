import { SiZend } from "react-icons/si";
import ListItem from "./ListItem";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../../../utils/stores/store";
import { motion } from "framer-motion";
import { trpc } from "../../../utils/trpcClient";

type LogoProps = {
  variant: "default" | "list";
};

const Logo: FC<LogoProps> = ({ variant }) => {
  const navigate = useNavigate();
  const { isSearchActive } = useStore();

  const { email } = useStore();
  const ctx = trpc.useContext();
  const userData = ctx.getUser.getData(email);

  return (
    <div>
      <ListItem
        onClick={() => navigate(`/${userData?.username}`)}
        head={variant === "default" ? "" : "Zenchat"}
        hover="blank"
        variant={variant}
      >
        <motion.div
          animate={{
            rotate: isSearchActive ? 90 : 0,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
        >
          <SiZend className="h-[28px] w-[28px] rotate-90" />
        </motion.div>
      </ListItem>
    </div>
  );
};

export default Logo;
