import { useRef, useEffect } from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";

const ChatHistory = ({
  currentUser,
  currentChat,
  loadMoreItems,
  newMessageReceived,
}) => {
  const scrollViewRef = useRef();

  useEffect(() => {
    if (currentChat && currentChat.length > 0) {
      scrollViewRef.current.scrollToIndex({ index: 0, animated: true });
    }
  }, [newMessageReceived]);

  return currentChat ? (
    <FlatList
      ref={scrollViewRef}
      style={styles.container}
      data={currentChat}
      renderItem={({ item: message }) =>
        message.fromId == currentUser ? (
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{message.content}</Text>
          </View>
        ) : (
          <View style={styles.otherBubble}>
            <Text>{message.content}</Text>
          </View>
        )
      }
      keyExtractor={(message) => message.id.toString()}
      onEndReached={loadMoreItems}
      onEndReachedThreshold={0.1}
      inverted
    />
  ) : (
    <View style={styles.container}>
      <Text>x</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 0,
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
    maxWidth: "60%",
    backgroundColor: "white",
  },
  userText: {
    color: "white",
  },
});

export default ChatHistory;
