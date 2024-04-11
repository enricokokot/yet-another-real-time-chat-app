import { View, StyleSheet, Pressable } from "react-native";
import Circle from "./Circle";

const UsersList = ({
  currentUser,
  users,
  // friendStuff,
  startChat,
  // inbox,
  activeChat,
}) => {
  const usersYouAlreadyChatWith = currentUser.chats
    .map((chat) =>
      chat.users.map((user) => user.id).filter((id) => id !== currentUser.id)
    )
    .filter((chat) => chat.length === 1)
    .map((chat) => chat[0]);
  return (
    <>
      {users
        .filter((user) => !usersYouAlreadyChatWith.includes(user.id))
        .map((user) => (
          <View key={user.id} style={styles.container}>
            <Circle
              content={user.username}
              style={
                user.id === activeChat && {
                  borderWidth: 2,
                  borderColor: "#000",
                }
              }
            />
            <Pressable
              style={styles.bottomLeft}
              onPress={() => startChat(user.id)}
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
});

export default UsersList;
