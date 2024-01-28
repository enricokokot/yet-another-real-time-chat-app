import React from "react";
import { View, StyleSheet } from "react-native";

const VerticalLine = ({ color, thickness, height }) => {
  return (
    <View
      style={[
        styles.line,
        { backgroundColor: color, width: thickness, height: height },
      ]}
    />
  );
};

VerticalLine.defaultProps = {
  color: "black", // Default color
  thickness: 1, // Default thickness
  height: 100, // Default height
};

const styles = StyleSheet.create({
  line: {
    // Default style for the line
  },
});

export default VerticalLine;
