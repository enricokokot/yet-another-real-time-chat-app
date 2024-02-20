import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import handleGettingChatHistory from "../api/getchat";

const ChatHistory = ({ currentUser, currentSubject }) => {
  const [currentChat, setCurrentChat] = useState([]);

  const getChatHistory = async (user, subject) => {
    if (!user || !subject) {
      console.log("user or subject is empty!");
      return;
    }
    try {
      const data = await handleGettingChatHistory(user, subject);
      const parsedData = JSON.parse(data);
      const chatHistory = parsedData.data;
      setCurrentChat(chatHistory.map((message) => message));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getChatHistory(currentUser, currentSubject);
  }, [currentSubject]);

  return currentChat ? (
    <View style={styles.container}>
      {currentChat.map((message) =>
        message.fromId == currentUser ? (
          <View style={styles.userBubble} key={message.timestamp}>
            <Text style={styles.userText}>{message.content}</Text>
          </View>
        ) : (
          <View style={styles.otherBubble} key={message.timestamp}>
            <Text>{message.content}</Text>
          </View>
        )
      )}
    </View>
  ) : (
    <View style={styles.container}>
      <Text>x</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 300,
    backgroundColor: "#C6ECFD",
  },
  userBubble: {
    padding: 5,
    margin: 2,
    backgroundColor: "#09ADF6",
  },
  userText: {
    color: "white",
  },
  otherBubble: {
    padding: 5,
    margin: 2,
    alignItems: "flex-end",
    backgroundColor: "white",
  },
});

export default ChatHistory;
