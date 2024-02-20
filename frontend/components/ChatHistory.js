import { useRef, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";

const ChatHistory = ({ currentUser, currentChat }) => {
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  }, [currentChat]);

  return currentChat ? (
    <ScrollView ref={scrollViewRef} style={styles.container}>
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
    </ScrollView>
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
  otherBubble: {
    padding: 5,
    margin: 2,
    alignItems: "flex-end",
    backgroundColor: "white",
  },
  userText: {
    color: "white",
  },
});

export default ChatHistory;
