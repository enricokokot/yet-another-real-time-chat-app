import { useState } from "react";
import { View, StyleSheet, Text, TextInput, Button } from "react-native";
import ChatHistory from "./ChatHistory";
import handleSendMessage from "../api/sendmessage";

const ChatScreen = ({ subject, currentUser }) => {
  const [text, onChangeText] = useState("");

  const handleSend = async () => {
    await handleSendMessage(currentUser.username, subject, text);
  };

  return (
    <View style={styles.container}>
      <Text>{subject}</Text>
      <ChatHistory
        currentUser={currentUser.username}
        currentSubject={subject}
      />
      <View style={styles.sender}>
        <View style={{ flex: 4 }}>
          <TextInput style={styles.input} onChangeText={onChangeText} />
        </View>
        <View style={{ flex: 1 }}>
          <Button onPress={handleSend} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  sender: {
    flexDirection: "row",
  },
  input: {
    borderWidth: 1,
  },
});

export default ChatScreen;
