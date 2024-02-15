import React from "react";
import { View, Button, StyleSheet } from "react-native";
import Circle from "./Circle";

const ChatApp = ({ onLogout, currentUser }) => {
  const submit = () => {
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Circle
        style={styles.paddedElement}
        content={currentUser.username}
      ></Circle>
      <Button onPress={() => submit()} title="log out" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paddedElement: {
    margin: 10,
  },
});

export default ChatApp;
