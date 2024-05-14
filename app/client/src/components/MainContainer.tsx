import { FC, ReactElement } from "react";

type ContainerProps = {
  children: ReactElement;
};

const MainContainer: FC<ContainerProps> = ({ children }) => {
  return (
    <div className="flex w-full items-center justify-center">{children}</div>
  );
};

export default MainContainer;
