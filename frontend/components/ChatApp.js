import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Circle from "./Circle";
import handleUsersFetch from "../api/users";
import UsersList from "./UsersList";
import handleUsersMakingFriends from "../api/addfriend";
import handleUsersRemovingFriends from "../api/removefriend";
import ChatScreen from "./ChatScreen";
import handleOpeningWebSocket from "../api/ws";

const ChatApp = ({ onLogout, currentUser, token }) => {
  const [friends, setFriends] = useState([]);
  const [others, setOthers] = useState([]);
  const [currentSubject, setCurrentSubject] = useState("");
  const [ws, setWs] = useState(null);
  const [inbox, setInbox] = useState([]);

  const openWebSocket = () => {
    const ws = handleOpeningWebSocket(currentUser.id, setInbox);
    setWs(ws);
  };

  useEffect(() => {
    openWebSocket();
    fetchUsers();
  }, []);

  useEffect(() => {
    setInbox(
      inbox.filter((message) => message.fromId !== currentSubject.username)
    );
  }, [currentSubject]);

  const fetchUsers = async () => {
    try {
      const allUsers = await handleUsersFetch("undefined", token);
      const actualUsers = Array.from(JSON.parse(allUsers));
      const actualFriends = currentUser.friends;
      const usersBesideCurrentUser = actualUsers.filter(
        (user) => user.username !== currentUser.username
      );
      const userOthers = usersBesideCurrentUser.filter(
        (user) =>
          !actualFriends
            .map((friend) => friend.username)
            .includes(user.username)
      );

      setFriends(actualFriends);
      setOthers(userOthers);
    } catch (error) {
      console.log(error);
    }
  };

  const addFriend = async (user) => {
    try {
      setFriends([...friends, user]);
      setOthers(others.filter((other) => other.username !== user.username));
      await handleUsersMakingFriends(
        currentUser.username,
        user.username,
        token
      );
    } catch (error) {
      console.log(error);
    }
  };

  const removeFriend = async (user) => {
    try {
      setFriends(friends.filter((friend) => friend.username !== user.username));
      setOthers([...others, user]);
      await handleUsersRemovingFriends(
        currentUser.username,
        user.username,
        token
      );
    } catch (error) {
      console.log(error);
    }
  };

  const changeSubject = (user) => {
    setCurrentSubject(user);
  };

  const submit = () => {
    ws.close();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.horizontalBar}>
        <Pressable onPress={() => submit()}>
          <Circle style={styles.paddedElement} content={currentUser.username} />
        </Pressable>
        <UsersList
          users={others}
          friendStuff={addFriend}
          startChat={changeSubject}
          inbox={inbox}
          currentSubject={currentSubject}
        />
      </View>
      <View style={styles.underBar}>
        <View style={styles.verticalBar}>
          <UsersList
            users={friends}
            friendStuff={removeFriend}
            startChat={changeSubject}
            inbox={inbox}
            currentSubject={currentSubject}
          />
        </View>
        <ChatScreen
          subject={currentSubject}
          currentUser={currentUser}
          connection={ws}
          inbox={inbox}
          token={token}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paddedElement: {
    margin: 10,
  },
  horizontalBar: {
    height: 100,
    backgroundColor: "#e8f3fd",
    alignItems: "center",
    paddingLeft: 5,
    flexDirection: "row",
  },
  underBar: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  verticalBar: {
    width: 100,
    backgroundColor: "#e8f3fd",
    alignItems: "center",
    paddingTop: 10,
  },
});

export default ChatApp;
