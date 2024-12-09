import React from "react";

const UserList = ({ users, onSelectUser }) => {
  return (
    <ul>
      {users.map((user) => (
        <li key={user._id} onClick={() => onSelectUser(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
};

export default UserList;
