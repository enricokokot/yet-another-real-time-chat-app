import React from "react";
import { Button, SafeAreaView, StyleSheet, TextInput } from "react-native";
import handleSignin from "../api/signin";
import handleLogin from "../api/login";

export default function SigninForm({ onLogin, port }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordAgain, setPasswordAgain] = React.useState("");

  const submit = async () => {
    try {
      const response = await handleSignin(
        port,
        username,
        password,
        passwordAgain
      );
      const parsedResponse = JSON.parse(response);
      const tokenResponse = await handleLogin(port, username, password);
      const parsedTokenResponse = JSON.parse(tokenResponse);
      onLogin(parsedResponse.user, parsedTokenResponse.token.access_token);
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
      <TextInput
        style={styles.input}
        onChangeText={setPasswordAgain}
        value={passwordAgain}
        placeholder="password again"
        secureTextEntry
      />
      <Button onPress={() => submit()} title="sign in" />
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
