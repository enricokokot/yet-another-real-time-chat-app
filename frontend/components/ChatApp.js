import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import Circle from "./Circle";
import handleUsersFetch from "../api/users";
import UsersList from "./UsersList";

const ChatApp = ({ onLogout, currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [others, setOthers] = useState([]);

  const fetchUsers = async () => {
    try {
      const allUsers = await handleUsersFetch();
      const userFriends = await handleUsersFetch(currentUser.username);

      const actualUsers = Array.from(JSON.parse(allUsers));
      const actualFriends = Array.from(JSON.parse(userFriends));

      const usersBesideCurrentUser = actualUsers.filter(
        (user) => user != currentUser.username
      );
      const userOthers = usersBesideCurrentUser.filter(
        (user) => !actualFriends.includes(user)
      );

      setFriends(actualFriends);
      setOthers(userOthers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => fetchUsers, [currentUser]);

  const submit = () => {
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Circle
        style={styles.paddedElement}
        content={currentUser.username}
      ></Circle>
      <View style={{ flexDirection: "row" }}>
        <UsersList users={friends} title={"friends"} />
        <UsersList users={others} title={"others"} />
      </View>
      <View style={styles.paddedElement}>
        <Button onPress={() => submit()} title="log out" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paddedElement: {
    margin: 10,
  },
});

export default ChatApp;
