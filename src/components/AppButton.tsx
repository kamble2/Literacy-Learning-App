import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { theme } from "../theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function AppButton({ title, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.md,
    alignItems: "center",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
});
