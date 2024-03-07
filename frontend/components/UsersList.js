import { View, StyleSheet, Pressable } from "react-native";
import Circle from "./Circle";

const UsersList = ({
  users,
  friendStuff,
  startChat,
  inbox,
  currentSubject,
}) => {
  return (
    <>
      {users.map((user) => (
        <View key={user.id} style={styles.container}>
          <Circle
            content={user.username}
            style={
              user.id === currentSubject.id && {
                borderWidth: 2,
                borderColor: "#000",
              }
            }
          />
          <Pressable style={styles.bottomLeft} onPress={() => startChat(user)}>
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
            onPress={() => friendStuff(user)}
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
          </Pressable>
          {inbox.filter((msg) => msg.data.fromId === user.id).length !== 0 &&
            user.id !== currentSubject.id && (
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
                  inbox.filter((msg) => msg.data.fromId === user.id).length
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
});

export default UsersList;
