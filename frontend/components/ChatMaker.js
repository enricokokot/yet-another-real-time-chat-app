import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView, Pressable } from "react-native";
import Circle from "./Circle";

const ChatMaker = ({ style, users, createChat }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [unselectedUsers, setUnselectedUsers] = useState(users);

  const addUserToChat = (user) => () => {
    setSelectedUsers((prev) => [...prev, user]);
    setUnselectedUsers((prev) => prev.filter((usr) => usr.id !== user.id));
  };

  const removeUserFromChat = (user) => () => {
    setSelectedUsers((prev) => prev.filter((usr) => usr.id !== user.id));
    setUnselectedUsers((prev) => [...prev, user]);
  };

  return (
    <View style={[style, styles.modal]}>
      <Text style={styles.titleText}>Create Chat</Text>
      <ScrollView
        horizontal
        style={[styles.userList, { backgroundColor: "red" }]}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {unselectedUsers.map((user) => (
          <Pressable onPress={addUserToChat(user)} style={styles.userInList}>
            <Circle key={user.id} content={user.username} />
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        style={[styles.userList, { backgroundColor: "green" }]}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selectedUsers.map((user) => (
          <Pressable
            onPress={removeUserFromChat(user)}
            style={styles.userInList}
          >
            <Circle key={user.id} content={user.username} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.submitButton}>
        <Pressable onPress={() => createChat(selectedUsers)}>
          <Text style={{ fontWeight: "bold" }}>CREATE</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#e8f3fd",
    borderRadius: 10,
    padding: 10,
    minHeight: 300,
    maxHeight: 300,
    minWidth: 300,
  },
  userList: {
    flex: 3,
    maxHeight: 100,
    minHeight: 100,
  },
  userInList: {
    paddingHorizontal: 2,
  },
  titleText: {
    fontWeight: "bold",
    flex: 1,
  },
  submitButton: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default ChatMaker;
