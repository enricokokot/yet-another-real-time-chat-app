import { View, Button, StyleSheet, Text } from "react-native";

const UsersList = ({ users, title, friendStuff, startChat }) => {
  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold" }}>{title}</Text>
      {users.map((user) => (
        <View style={styles.paddedElement} key={user}>
          <Button title={user} onPress={() => friendStuff(user)}></Button>
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
