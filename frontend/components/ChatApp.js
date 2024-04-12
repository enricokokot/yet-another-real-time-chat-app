import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Circle from "./Circle";
import handleUsersFetch from "../api/users";
import UsersList from "./UsersList";
// import handleUsersMakingFriends from "../api/addfriend";
// import handleUsersRemovingFriends from "../api/removefriend";
import ChatScreen from "./ChatScreen";
import handleOpeningWebSocket from "../api/ws";
import ChatsList from "./ChatsList";

const ChatApp = ({ onLogout, currentUser, token }) => {
  // const [friends, setFriends] = useState([]);
  // const [others, setOthers] = useState([]);
  const [usersExceptUser, setUsersExceptUser] = useState([]);
  // const [currentSubject, setCurrentSubject] = useState("");
  const [activeChat, setActiveChat] = useState(0);
  const [ws, setWs] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [unknownInInbox, setUnknownInInbox] = useState(false);
  const { height } = useWindowDimensions();
  const [pageNumber, setPageNumber] = useState(0);
  const [userSelected, setUserSelected] = useState(false);
  const [chats, setChats] = useState([]);

  const openWebSocket = () => {
    const ws = handleOpeningWebSocket(currentUser.id, setInbox);
    setWs(ws);
  };

  useEffect(() => {
    setChats(currentUser.chats);
    openWebSocket();
    fetchUsers();
  }, []);

  useEffect(() => {
    setInbox(inbox.filter((message) => message.data.toId !== activeChat));
  }, [activeChat]);

  useEffect(() => {
    if (inbox.length === 0) return;
    if (
      !chats.map((chat) => chat.id).includes(inbox[inbox.length - 1].data.toId)
    ) {
      console.log("unknown in inbox!");
      setUnknownInInbox((prev) => !prev);
    }
  }, [inbox]);

  useEffect(() => {
    // fetchUsers();
    const lastMessage = inbox[inbox.length - 1];
    if (!lastMessage) return;
    setChats((previousChats) => [
      {
        id: lastMessage.data.toId,
        users: [
          { id: currentUser.id, username: currentUser.username },
          {
            id: lastMessage.data.fromId,
            username: lastMessage.data.fromId,
          },
        ],
      },
      ...previousChats,
    ]);
  }, [unknownInInbox]);

  const fetchUsers = async () => {
    try {
      const allUsers = await handleUsersFetch("undefined", token);
      const actualUsers = Array.from(JSON.parse(allUsers));
      console.log("ChatApp.js: actualUsers: ", actualUsers);
      // const actualFriends = currentUser.friends;
      const usersBesideCurrentUser = actualUsers.filter(
        (user) => user.username !== currentUser.username
      );
      // const userOthers = usersBesideCurrentUser.filter(
      //   (user) =>
      //     !actualFriends
      //       .map((friend) => friend.username)
      //       .includes(user.username)
      // );

      // setFriends(actualFriends);
      // setOthers(userOthers);
      console.log(
        "ChatApp.js: usersBesideCurrentUser: ",
        usersBesideCurrentUser
      );
      setUsersExceptUser(usersBesideCurrentUser);
    } catch (error) {
      console.log(error);
    }
  };

  // const addFriend = async (user) => {
  //   try {
  //     setFriends([...friends, user]);
  //     setOthers(others.filter((other) => other.username !== user.username));
  //     await handleUsersMakingFriends(
  //       currentUser.username,
  //       user.username,
  //       token
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const removeFriend = async (user) => {
  //   try {
  //     setFriends(friends.filter((friend) => friend.username !== user.username));
  //     setOthers([...others, user]);
  //     await handleUsersRemovingFriends(
  //       currentUser.username,
  //       user.username,
  //       token
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const changeSubject = (chatId, isUserSelected) => {
    setUserSelected(isUserSelected);
    setActiveChat(chatId);
    setPageNumber(0);
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
        <ScrollView horizontal>
          <UsersList
            currentUser={currentUser}
            users={usersExceptUser}
            // friendStuff={addFriend}
            startChat={changeSubject}
            inbox={inbox}
            activeChat={activeChat}
            userSelected={userSelected}
          />
        </ScrollView>
      </View>
      <View style={styles.underBar}>
        <View style={[styles.verticalBar, { height: height - 100 }]}>
          <ScrollView>
            <ChatsList
              currentUser={currentUser}
              chats={chats}
              // friendStuff={removeFriend}
              startChat={changeSubject}
              inbox={inbox}
              activeChat={activeChat}
              userSelected={userSelected}
            />
          </ScrollView>
        </View>
        <ChatScreen
          subject={activeChat}
          currentUser={currentUser}
          connection={ws}
          inbox={inbox}
          token={token}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          setInbox={setInbox}
          isUserSelected={userSelected}
          setUsersExceptUser={setUsersExceptUser}
          setChats={setChats}
          usersExceptUser={usersExceptUser}
          changeSubject={changeSubject}
          chats={chats}
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
