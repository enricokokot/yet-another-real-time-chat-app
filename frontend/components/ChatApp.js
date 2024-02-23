import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import Circle from "./Circle";
import handleUsersFetch from "../api/users";
import UsersList from "./UsersList";
import handleUsersMakingFriends from "../api/addfriend";
import handleUsersRemovingFriends from "../api/removefriend";
import ChatScreen from "./ChatScreen";
import handleOpeningWebSocket from "../api/ws";

const ChatApp = ({ onLogout, currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [others, setOthers] = useState([]);
  const [currentSubject, setCurrentSubject] = useState("");
  const [ws, setWs] = useState(null);
  const [inbox, setInbox] = useState([]);

  const openWebSocket = () => {
    const ws = handleOpeningWebSocket(currentUser.username, setInbox);
    setWs(ws);
  };

  useEffect(() => {
    openWebSocket();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = await handleUsersFetch();
      const usersFriends = await handleUsersFetch(currentUser.username);
      const actualUsers = Array.from(JSON.parse(allUsers));
      const actualFriends = Array.from(JSON.parse(usersFriends));

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
    setInbox((inbox) =>
      inbox.filter((message) => message.data.fromId !== currentSubject)
    );
  };

  const submit = () => {
    ws.close();
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
          inbox={inbox}
        />
        <UsersList
          users={others}
          title={"others"}
          friendStuff={addFriend}
          startChat={changeSubject}
          inbox={inbox}
        />
      </View>
      <ChatScreen
        subject={currentSubject}
        currentUser={currentUser}
        connection={ws}
      />
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
