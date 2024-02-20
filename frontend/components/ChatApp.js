import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import Circle from "./Circle";
import handleUsersFetch from "../api/users";
import UsersList from "./UsersList";
import handleUsersMakingFriends from "../api/addfriend";
import handleUsersRemovingFriends from "../api/removefriend";
import ChatScreen from "./ChatScreen";

const ChatApp = ({ onLogout, currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [others, setOthers] = useState([]);
  const [currentSubject, setCurrentSubject] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [friends]);

  const fetchUsers = async () => {
    try {
      const allUsers = await handleUsersFetch();
      const actualUsers = Array.from(JSON.parse(allUsers));
      const actualFriends = currentUser.friends;

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

  const addFriend = async (user) => {
    try {
      await handleUsersMakingFriends(currentUser.username, user);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const removeFriend = async (user) => {
    try {
      await handleUsersRemovingFriends(currentUser.username, user);
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const changeSubject = (user) => {
    setCurrentSubject(user);
  };

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
        <UsersList
          users={friends}
          title={"friends"}
          friendStuff={removeFriend}
          startChat={changeSubject}
        />
        <UsersList
          users={others}
          title={"others"}
          friendStuff={addFriend}
          startChat={changeSubject}
        />
      </View>
      <ChatScreen subject={currentSubject} currentUser={currentUser} />
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
