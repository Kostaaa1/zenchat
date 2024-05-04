import React, { FC } from "react";
import List from "../List";
import { TUserDataState } from "../../../../server/src/types/types";

type RenderSearchedUsersProps = {
  searchedUsers: TUserDataState[];
  //   handleListClick: () => void;
};

const RenderSearchedUsers: FC<RenderSearchedUsersProps> = ({
  searchedUsers,
}) => {
  //   return <div>RenderSearchedUsers</div>;
  return (
    <div>
      {searchedUsers.map((user) => (
        <List
          title={user?.username}
          key={user?.id}
          image_url={[user?.image_url]}
          hover="darker"
          subtitle={`${user?.first_name} ${user?.last_name}`}
          //   onClick={() => {
          //     const { username, id } = user;
          //     handleListClick({
          //       username,
          //       id,
          //     });
          //   }}
        />
      ))}
    </div>
  );
};

export default RenderSearchedUsers;
