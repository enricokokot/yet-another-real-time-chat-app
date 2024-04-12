import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";

const ChatMaker = ({ style, users }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [unselectedUsers, setUnselectedUsers] = useState(users);

  return (
    <View style={[style, styles.modal]}>
      <Text style={{ fontWeight: "bold" }}>Create Chat</Text>
      {selectedUsers.map((user) => user.username)}
      {unselectedUsers.map((user) => user.username)}
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#e8f3fd",
    borderRadius: 10,
    padding: 10,
  },
});

export default ChatMaker;
