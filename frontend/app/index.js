import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginForm from "../components/LoginForm";
import SigninForm from "../components/SigninForm";
import VerticalLine from "../components/VerticalLine";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <LoginForm />
      <VerticalLine height={350} color="grey" />
      <SigninForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
