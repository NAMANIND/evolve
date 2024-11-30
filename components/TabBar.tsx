import { View, Platform, StyleSheet, LayoutChangeEvent } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import dashboard from "@/app/(tabs)/dashboard";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import TabBarButton from "./TabBarButton";
import { icons } from "@/constants/icons";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const [dimensions, setDimensions] = useState({ width: 100, height: 20 });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabBarlayout = (e: LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  const tabPositionX = useSharedValue(0);

  useEffect(() => {
    tabPositionX.value = withSpring(state.index * buttonWidth);
  }, [state.index, buttonWidth]);

  const animatedstyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  const shown = useGlobalContext().tabBarShown;

  return (
    <View
      onLayout={onTabBarlayout}
      style={[
        styles.tabbar,

        {
          display: shown ? "flex" : "none",
        },
      ]}
    >
      <Animated.View
        style={[
          animatedstyle,
          {
            position: "absolute",
            backgroundColor: colors.primary,
            borderRadius: 30,
            marginHorizontal: 12,
            height: dimensions.height - 15,
            width: buttonWidth - 25,
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            route={route.name}
            options={options}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            colors={colors}
            label={
              typeof label === "function"
                ? label({
                    focused: isFocused,
                    color: isFocused ? colors.primary : colors.text,
                    position: "below-icon",
                    children: "",
                  })
                : label
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    // display: "none",
    position: "absolute",
    bottom: 10, // 50
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20, // 80
    paddingVertical: 10, // 15
    borderRadius: 35, // 35
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
    gap: 0,
  },
});
