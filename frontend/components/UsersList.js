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
        <View key={user} style={styles.container}>
          <Circle content={user} />
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
          {inbox.filter((msg) => msg.data.fromId.includes(user)).length !== 0 &&
            user !== currentSubject && (
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
                  currentSubject === user
                    ? 0
                    : inbox.filter((msg) => msg.data.fromId.includes(user))
                        .length
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
