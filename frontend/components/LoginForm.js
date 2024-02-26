import React from "react";
import { Button, SafeAreaView, StyleSheet, TextInput } from "react-native";
import handleLogin from "../api/login";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submit = async () => {
    try {
      const response = await handleLogin(username, password);
      const parsedResponse = JSON.parse(response);
      onLogin(parsedResponse.user, parsedResponse.token.access_token);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        value={username}
        placeholder="username"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="password"
        secureTextEntry
      />
      <Button onPress={() => submit()} title="log in" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
