import React from "react";
import { Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import Screen from "../components/Screen";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

export default function DetailsScreen({ route }: Props) {
  const id = route.params?.id ?? "no-id";

  return (
    <Screen>
      <Text style={{ fontSize: theme.typography.h2, fontWeight: "700", color: theme.colors.text }}>
        Details
      </Text>
      <Text style={{ marginTop: theme.spacing.md, color: theme.colors.muted }}>
        id: {id}
      </Text>
    </Screen>
  );
}
