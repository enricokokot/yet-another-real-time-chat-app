import { View, StyleSheet, Text } from "react-native";

const ChatHistory = ({ currentUser, currentChat }) => {
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
