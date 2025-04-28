import { Stack, Redirect } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Redirect href="/boarding" />
    </>
  );}
