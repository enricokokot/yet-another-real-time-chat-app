import { View, StyleSheet, Pressable, Text } from "react-native";
import Circle from "./Circle";
import { useState } from "react";
import handleUsersFetch from "../api/users";
import { useInterval } from "../hooks/useInterval";
import moment from "moment";

const ChatsList = ({
  currentUser,
  chats,
  // friendStuff,
  startChat,
  inbox,
  activeChat,
  userSelected,
  token,
}) => {
  console.log("ChatsList.js: chats: ", chats);
  const [lastActiveOfUsers, setLastActiveOfUsers] = useState({});
  const [visibilityOfLastSeen, setVisibilityOfLastSeen] = useState(
    chats
      .filter((chat) => chat.users.length === 2)
      .map((chat) => chat.users.find((user) => user.id !== currentUser.id))
      .map((userId) => {
        return { [userId]: false };
      })
  );

  useInterval(async () => {
    const chatsWithOneUser = chats.filter((chat) => chat.users.length === 2);
    const usersInChat = chatsWithOneUser.map((chat) =>
      chat.users.filter((user) => user.id !== currentUser.id)
    );
    const actualUsersIds = usersInChat.map((user) => user[0].id);
    const newestestOfObjects = await actualUsersIds.reduce(
      async (prevPromise, userId) => {
        const prevObject = await prevPromise;
        const response = await handleUsersFetch(userId, token);
        const parsedResponse = JSON.parse(response);
        const newObject = { [userId]: parsedResponse.lastActive };
        return { ...prevObject, ...newObject };
      },
      Promise.resolve({})
    );
    setLastActiveOfUsers(newestestOfObjects);
  }, 3000);

  const showLastSeen = (chatId) => {
    const idOfLastSeenYouChange = chats
      .find((chat) => chat.id === chatId)
      .users.find((user) => user.id !== currentUser.id).id;
    const newVisibilityOfLastSeen = {
      ...visibilityOfLastSeen,
      ...{ [idOfLastSeenYouChange]: true },
    };
    setVisibilityOfLastSeen(newVisibilityOfLastSeen);
    console.log("newVisibilityOfLastSeen: ", newVisibilityOfLastSeen);
  };

  const hideLastSeen = (chatId) => {
    const idOfLastSeenYouChange = chats
      .find((chat) => chat.id === chatId)
      .users.find((user) => user.id !== currentUser.id).id;
    const newVisibilityOfLastSeen = {
      ...visibilityOfLastSeen,
      ...{ [idOfLastSeenYouChange]: false },
    };
    setVisibilityOfLastSeen(newVisibilityOfLastSeen);
    console.log("newVisibilityOfLastSeen:", newVisibilityOfLastSeen);
  };

  return (
    <>
      {chats.map((chat) => (
        <View key={chat.id} style={styles.container}>
          <Circle
            content={chat.users
              .filter((user) => user.id !== currentUser.id)
              .map((user) => user.username)
              .join(", ")}
            style={
              chat.id === activeChat &&
              !userSelected && {
                borderWidth: 2,
                borderColor: "#000",
              }
            }
          />
          <Pressable
            style={styles.bottomLeft}
            onPress={() => startChat(chat.id, false)}
          >
            <Circle
              style={{
                width: 35,
                height: 35,
                borderWidth: 1,
                borderColor: "#fff",
              }}
              content={"💬"}
            />
          </Pressable>
          {/* <Pressable
            style={styles.bottomRight}
            onPress={() => friendStuff(user)}
            onPress={() => {}}
          >
            <Circle
              style={{
                width: 35,
                height: 35,
                borderWidth: 1,
                borderColor: "#fff",
              }}
              content={"+"}
            />
          </Pressable> */}
          {chat.users.length === 2 && (
            <Pressable
              style={styles.bottomRight}
              onHoverIn={() => {
                lastActiveOfUsers[
                  chat.users
                    .filter((user) => user.id !== currentUser.id)
                    .map((user) => user.id)[0]
                ] +
                  10 >
                  Math.floor(Date.now() / 1000) || showLastSeen(chat.id);
              }}
              onHoverOut={() => {
                lastActiveOfUsers[
                  chat.users
                    .filter((user) => user.id !== currentUser.id)
                    .map((user) => user.id)[0]
                ] +
                  10 >
                  Math.floor(Date.now() / 1000) || hideLastSeen(chat.id);
              }}
            >
              <Circle
                style={[
                  styles.activityIcon,
                  lastActiveOfUsers[
                    chat.users
                      .filter((user) => user.id !== currentUser.id)
                      .map((user) => user.id)[0]
                  ] +
                    10 >
                  Math.floor(Date.now() / 1000)
                    ? styles.active
                    : styles.inactive,
                ]}
              />
              {visibilityOfLastSeen[
                chat.users.find((user) => user.id !== currentUser.id).id
              ] && (
                <Text style={styles.lastSeen}>
                  {moment
                    .unix(
                      lastActiveOfUsers[
                        chat.users
                          .filter((user) => user.id !== currentUser.id)
                          .map((user) => user.id)[0]
                      ]
                    )
                    .fromNow()}
                </Text>
              )}
            </Pressable>
          )}
          {inbox.filter((msg) => msg.data.toId === chat.id).length !== 0 &&
            chat.id !== activeChat && (
              <Circle
                style={[
                  styles.topRight,
                  {
                    width: 35,
                    height: 35,
                    backgroundColor: "red",
                  },
                ]}
                content={
                  inbox.filter((msg) => msg.data.toId === chat.id).length
                }
              />
            )}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  topRight: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  activityIcon: {
    width: 20,
    height: 20,
    bottom: 5,
    right: 5,
  },
  active: { backgroundColor: "#31cc46" },
  inactive: { backgroundColor: "#aeaeae" },
  lastSeen: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    padding: 3,
    borderRadius: 5,
  },
});

export default ChatsList;
