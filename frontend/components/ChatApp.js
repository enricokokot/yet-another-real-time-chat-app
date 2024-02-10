import React from "react";
import { View, Button, StyleSheet } from "react-native";

const ChatApp = ({ onLogout }) => {
  const submit = () => {
    onLogout();
  };

  return (
    <View style={styles.container}>
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
});

export default ChatApp;
