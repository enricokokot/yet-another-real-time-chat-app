import { View, Button, StyleSheet, Text } from "react-native";

const UsersList = ({ users, title, friendStuff, startChat, inbox }) => {
  console.log("UsersLIstInbox: " + Array.from(inbox));

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold" }}>{title}</Text>
      {users.map((user) => (
        <View style={styles.paddedElement} key={user}>
          <Button title={user} onPress={() => friendStuff(user)}></Button>
          <Text>
            Messages in inbox:{" "}
            {inbox.filter((msg) => msg.data.fromId.includes(user)).length}
          </Text>
          <Button title={"chat"} onPress={() => startChat(user)}></Button>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  paddedElement: {
    margin: 5,
  },
});

export default UsersList;
