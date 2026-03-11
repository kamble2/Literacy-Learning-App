import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import Screen from "../components/Screen";
import AppButton from "../components/AppButton";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>MyApp</Text>
        <Text style={styles.subtitle}>React Native skeleton</Text>
      </View>

      <AppButton
        title="Go to Details"
        onPress={() => navigation.navigate("Details", { id: "123" })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.xs, marginBottom: theme.spacing.lg },
  title: { fontSize: theme.typography.h1, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: theme.typography.body, color: theme.colors.muted },
});
