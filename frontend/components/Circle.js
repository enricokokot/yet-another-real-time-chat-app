import React from "react";
import { View, StyleSheet, Text } from "react-native";

const Circle = ({ style, content }) => {
  return (
    <View style={[styles.circle, style]}>
      <Text style={styles.text}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35, // Half of the width or height to create a circle
    backgroundColor: "#5394ef", // Example background color
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    color: "white",
    fontWeight: "400",
  },
});

export default Circle;
