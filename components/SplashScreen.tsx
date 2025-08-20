import React from "react";
import { Image, View } from "react-native";

export default function SplashScreen() {
  return (
    <View className="flex-1 justify-center items-center w-screen h-screen bg-background">
      <Image
        source={require("@/assets/images/splash-icon.png")}
        className="w-48 h-48"
      />
    </View>
  );
}
