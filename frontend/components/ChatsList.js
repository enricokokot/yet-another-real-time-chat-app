import { View, StyleSheet, Pressable } from "react-native";
import Circle from "./Circle";

const ChatsList = ({
  currentUser,
  chats,
  // friendStuff,
  startChat,
  inbox,
  activeChat,
  userSelected,
}) => {
  console.log("ChatsList.js: chats: ", chats);
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
          <Circle
            style={[styles.bottomRight, styles.activityIcon, styles.active]}
          />
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
});

export default ChatsList;
