import React from "react";
import { Button, SafeAreaView, StyleSheet, TextInput } from "react-native";
import handleSignin from "../api/signin";

export default function SigninForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordAgain, setPasswordAgain] = React.useState("");

  const submit = () => {
    try {
      const result = handleSignin(username, password, passwordAgain);
      console.log(result);
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
