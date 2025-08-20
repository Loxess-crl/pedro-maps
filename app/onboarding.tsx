import { Button } from "@/components/ui/button";
import StorageService from "@/services/storageService";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { Dimensions, Platform, StatusBar, Text, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string[];
}

const pages: OnboardingPage[] = [
  {
    id: "1",
    title: "Ubicación en Tiempo Real",
    description:
      "Sigue el recorrido de los buses y llega siempre a tiempo a tu destino",
    icon: (
      <LottieView
        source={require("@/assets/animations/bus.json")}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        loop
      />
    ),
    color: "#ffc300",
    gradient: ["#ffc300", "#ff8f00"],
  },
  {
    id: "2",
    title: "Horarios y Rutas",
    description:
      "Consulta fácilmente los horarios y rutas disponibles en un solo lugar",
    icon: (
      <LottieView
        source={require("@/assets/animations/location.json")}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        loop
      />
    ),
    color: "#ffc300",
    gradient: ["#ffc300", "#ff8f00"],
  },
  {
    id: "3",
    title: "Acceso Seguro",
    description:
      "Inicia sesión con tu correo institucional y usa el servicio sin preocupaciones",
    icon: (
      <LottieView
        source={require("@/assets/animations/success.json")}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        loop
      />
    ),
    color: "#ffc300",
    gradient: ["#ffc300", "#ff8f00"],
  },
];

interface PageItemProps {
  item: OnboardingPage;
  index: number;
  scrollX: SharedValue<number>;
}

const PageItem: React.FC<PageItemProps> = ({ item, index, scrollX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5]);
    const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50]);

    return {
      transform: [{ scale }, { translateY }],
      opacity,
      width,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const rotateY = interpolate(scrollX.value, inputRange, [45, 0, -45]);
    const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9]);

    return {
      transform: [{ rotateY: `${rotateY}deg` }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[animatedStyle]}
      className="flex-1 justify-center px-8"
    >
      {/* Icon Container with enhanced styling */}
      <Animated.View style={[iconAnimatedStyle]} className="mb-12 mx-auto">
        <View className="w-80 h-80 rounded-full bg-secondary/5 dark:bg-secondary/20 items-center justify-center shadow-lg">
          <View className="w-64 h-64 rounded-full bg-white/80 dark:bg-gray-800/80 items-center justify-center shadow-xl">
            <View className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center">
              {item.icon}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <View className="items-center">
        <Text className="text-4xl font-black text-foreground text-center mb-6 tracking-tight">
          {item.title}
        </Text>
        <Text className="text-xl text-muted-foreground text-center leading-relaxed max-w-sm">
          {item.description}
        </Text>
      </View>
    </Animated.View>
  );
};

interface ProgressIndicatorProps {
  pages: OnboardingPage[];
  scrollX: SharedValue<number>;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  pages,
  scrollX,
}) => {
  return (
    <View className="flex-row items-center justify-center px-8 mb-16">
      {pages.map((page, index) => (
        <Indicator
          key={index}
          index={index}
          scrollX={scrollX}
          color={page.color}
        />
      ))}
    </View>
  );
};

interface ActionButtonProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onSkip: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  currentPage,
  totalPages,
  onNext,
  onSkip,
}) => {
  const isLastPage = currentPage === totalPages - 1;

  const buttonStyle = useAnimatedStyle(() => {
    const scale = withSpring(1);
    const backgroundColor = interpolateColor(
      currentPage / (totalPages - 1),
      [0, 1],
      ["#ffc300", "#4ade80"]
    );

    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  return (
    <View className="px-8 pb-8">
      <Animated.View
        style={[buttonStyle]}
        className="rounded-2xl overflow-hidden"
      >
        <Button
          size="lg"
          className="w-full py-4 rounded-2xl bg-transparent"
          onPress={onNext}
        >
          <Text className="font-bold text-white text-lg tracking-wide">
            {isLastPage ? "Comenzar Ahora" : "Continuar"}
          </Text>
        </Button>
      </Animated.View>

      {!isLastPage && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 p-1"
          onPress={onSkip}
        >
          <Text className="text-muted-foreground font-medium">
            Saltar introducción
          </Text>
        </Button>
      )}
    </View>
  );
};

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const [currentPage, setCurrentPage] = useState(0);

  const goToLogin = async (): Promise<void> => {
    try {
      await StorageService.completeOnboarding();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Handle error appropriately
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const updateCurrentPage = (pageIndex: number): void => {
    setCurrentPage(pageIndex);
  };

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value / width,
      pages.map((_, index) => index),
      pages.map(() => "rgba(255, 195, 0, 0.05)")
    );

    return {
      backgroundColor,
    };
  });

  // Handler for next page or go to login
  const handleNext = () => {
    if (currentPage === pages.length - 1) {
      goToLogin();
    } else {
      // Scroll to next page
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      // Scroll FlatList to next page
      flatListRef?.current?.scrollToOffset({
        offset: nextPage * width,
        animated: true,
      });
    }
  };

  // Handler for skip
  const handleSkip = () => {
    goToLogin();
  };

  // Ref for FlatList
  const flatListRef = React.useRef<any>(null);

  return (
    <Animated.View style={[backgroundStyle]} className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0,
        }}
      />

      <View className="pt-8">
        <ProgressIndicator pages={pages} scrollX={scrollX} />
      </View>

      <View className="flex-1">
        <Animated.FlatList
          ref={flatListRef}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const pageIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            runOnJS(updateCurrentPage)(pageIndex);
          }}
          renderItem={({ item, index }) => (
            <PageItem item={item} index={index} scrollX={scrollX} />
          )}
        />
      </View>

      <ActionButton
        currentPage={currentPage}
        totalPages={pages.length}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </Animated.View>
  );
};

interface IndicatorProps {
  index: number;
  scrollX: SharedValue<number>;
  color: string;
}

const Indicator: React.FC<IndicatorProps> = ({ index, scrollX, color }) => {
  const progressStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const progress = interpolate(scrollX.value, inputRange, [0, 1, 0], "clamp");

    const backgroundColor = interpolateColor(
      progress,
      [0, 1],
      ["rgba(156, 163, 175, 0.3)", color]
    );

    const scaleX = interpolate(progress, [0, 1], [1, 1.5]);

    return {
      backgroundColor,
      transform: [{ scaleX }],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const isActive = interpolate(scrollX.value, inputRange, [0, 1, 0], "clamp");

    return {
      width: withSpring(isActive > 0.5 ? 32 : 8),
    };
  });

  return (
    <Animated.View
      style={[containerStyle]}
      className="h-2 rounded-full mx-1 overflow-hidden bg-gray-300 dark:bg-gray-600"
    >
      <Animated.View style={[progressStyle]} className="h-full rounded-full" />
    </Animated.View>
  );
};

export default OnboardingScreen;
