import SplashScreen from "@/components/SplashScreen";
import StorageService from "@/services/storageService";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function Index() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  useEffect(() => {
    checkIsOnboarding();
  }, [showOnboarding]);

  const checkIsOnboarding = async () => {
    const hasCompletedOnboarding =
      await StorageService.hasCompletedOnboarding();

    setShowOnboarding(!hasCompletedOnboarding);
  };

  if (showOnboarding === null) {
    return <SplashScreen />;
  }

  return showOnboarding ? (
    <Redirect href="/onboarding" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
