import { useState, useEffect } from "react";
import { View, StyleSheet, Text, TextInput, Button } from "react-native";
import ChatHistory from "./ChatHistory";
import handleGettingChatHistory from "../api/getchat";
import handleSendMessage from "../api/sendmessage";

const ChatScreen = ({ subject, currentUser, connection, inbox }) => {
  const [text, onChangeText] = useState("");
  const [currentChat, setCurrentChat] = useState([]);

  useEffect(() => {
    getChatHistory(currentUser.username, subject);
  }, [subject, inbox]);

  const getChatHistory = async (user, subject) => {
    if (!user || !subject) {
      console.log("user or subject is empty!");
      return;
    }
    try {
      const data = await handleGettingChatHistory(user, subject);
      const parsedData = JSON.parse(data);
      const chatHistory = parsedData.data.toReversed();
      setCurrentChat(chatHistory.map((message) => message));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSend = async () => {
    const data = {
      fromId: currentUser.username,
      toId: subject,
      content: text,
    };

    const wholeData = {
      type: "message",
      data: data,
    };

    connection.send(JSON.stringify(wholeData));

    await handleSendMessage(currentUser.username, subject, text);
    getChatHistory(currentUser.username, subject);
  };

  return (
    subject && (
      <View style={styles.container}>
        <Text>{subject}</Text>
        <ChatHistory
          currentUser={currentUser.username}
          currentChat={currentChat}
        />
        <View style={styles.sender}>
          <View style={{ flex: 5 }}>
            <TextInput style={styles.input} onChangeText={onChangeText} />
          </View>
          <View style={{ flex: 1 }}>
            <Button onPress={handleSend} />
          </View>
        </View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sender: {
    height: 50,
    flexDirection: "row",
    backgroundColor: "#e8f3fd",
  },
  input: {
    borderWidth: 1,
    backgroundColor: "white",
  },
});

export default ChatScreen;
