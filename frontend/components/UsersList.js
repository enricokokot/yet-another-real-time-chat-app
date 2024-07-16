import { View, StyleSheet, Pressable, Text } from "react-native";
import Circle from "./Circle";
import { useEffect, useState } from "react";
import handleUsersFetch from "../api/users";
import { useInterval } from "../hooks/useInterval";
import moment from "moment";

const UsersList = ({
  currentUser,
  users,
  // friendStuff,
  startChat,
  // inbox,
  activeChat,
  userSelected,
  token,
}) => {
  const [lastActiveOfUsers, setLastActiveOfUsers] = useState({});
  const [visibilityOfLastSeen, setVisibilityOfLastSeen] = useState(
    users.map((user) => {
      return { [user.id]: false };
    })
  );

  const usersYouAlreadyChatWith = currentUser.chats
    .map((chat) =>
      chat.users.map((user) => user.id).filter((id) => id !== currentUser.id)
    )
    .filter((chat) => chat.length === 1)
    .map((chat) => chat[0]);

  useInterval(async () => {
    const actualUsers = users.filter(
      (user) => !usersYouAlreadyChatWith.includes(user.id)
    );
    const actualUsersIds = actualUsers.map((user) => user.id);
    const newestOfObjects = await actualUsersIds.reduce(
      async (prevPromise, userId) => {
        const prevObject = await prevPromise;
        const response = await handleUsersFetch(userId, token);
        const parsedResponse = JSON.parse(response);
        const newObject = { [userId]: parsedResponse.lastActive };
        return { ...prevObject, ...newObject };
      },
      Promise.resolve({})
    );
    console.log("newObject: ", newestOfObjects);
    setLastActiveOfUsers(newestOfObjects);
  }, 3000);

  const showLastSeen = (userId) => {
    setVisibilityOfLastSeen({ ...visibilityOfLastSeen, ...{ [userId]: true } });
  };

  const hideLastSeen = (userId) => {
    setVisibilityOfLastSeen({
      ...visibilityOfLastSeen,
      ...{ [userId]: false },
    });
  };

  useEffect(() => {
    console.log("lastActiveOfUsers: ", lastActiveOfUsers);
  }, [lastActiveOfUsers]);

  return (
    <>
      {users
        .filter((user) => !usersYouAlreadyChatWith.includes(user.id))
        .map((user) => (
          <View key={user.id} style={styles.container}>
            <Circle
              content={user.username}
              style={
                user.id === activeChat &&
                userSelected && {
                  borderWidth: 2,
                  borderColor: "#000",
                }
              }
            />
            <Pressable
              style={styles.bottomLeft}
              onPress={() => startChat(user.id, true)}
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
            <Pressable
              style={styles.bottomRight}
              onHoverIn={() => {
                lastActiveOfUsers[user.id] + 10 >
                  Math.floor(Date.now() / 1000) || showLastSeen(user.id);
              }}
              onHoverOut={() => {
                lastActiveOfUsers[user.id] + 10 >
                  Math.floor(Date.now() / 1000) || hideLastSeen(user.id);
              }}
            >
              <Circle
                style={[
                  styles.activityIcon,
                  lastActiveOfUsers[user.id] + 10 >
                  Math.floor(Date.now() / 1000)
                    ? styles.active
                    : styles.inactive,
                ]}
              />
              {visibilityOfLastSeen[user.id] && lastActiveOfUsers[user.id] && (
                <Text style={styles.lastSeen}>
                  {moment.unix(lastActiveOfUsers[user.id]).fromNow()}
                </Text>
              )}
            </Pressable>
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

export default UsersList;
