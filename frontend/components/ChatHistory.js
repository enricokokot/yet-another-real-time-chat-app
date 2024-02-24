import { useRef, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";

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
    height: Dimensions.get("window").height * 0.5,
    backgroundColor: "#C6ECFD",
  },
  userBubble: {
    padding: 5,
    paddingHorizontal: 12,
    margin: 5,
    backgroundColor: "#09ADF6",
    borderRadius: 20,
    alignSelf: "flex-start",
    maxWidth: "60%",
  },
  otherBubble: {
    padding: 5,
    paddingHorizontal: 12,
    margin: 5,
    borderRadius: 20,
    alignSelf: "flex-end",
    backgroundColor: "white",
  },
  userText: {
    color: "white",
  },
});

export default ChatHistory;
