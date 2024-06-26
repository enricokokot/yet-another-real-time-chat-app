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

  const tryCreatingChat = (users) => {
    if (selectedUsers.length) {
      createChat(users);
    }
  };

  return (
    <View style={[style, styles.modal]}>
      <Text style={styles.titleText}>Create Chat</Text>
      <ScrollView
        horizontal
        style={styles.userList}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {unselectedUsers.map((user) => (
          <Pressable
            key={user.id}
            onPress={addUserToChat(user)}
            style={styles.userInList}
          >
            <Circle content={user.username} />
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        style={styles.userList}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selectedUsers.map((user) => (
          <Pressable
            key={user.id}
            onPress={removeUserFromChat(user)}
            style={styles.userInList}
          >
            <Circle content={user.username} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.submitButton}>
        <Pressable onPress={() => tryCreatingChat(selectedUsers)}>
          <Text
            style={{
              fontWeight: "bold",
              opacity: selectedUsers.length ? 1 : 0.15,
            }}
          >
            CREATE
          </Text>
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
