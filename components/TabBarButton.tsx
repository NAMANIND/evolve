import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { ReactNode, useEffect } from "react";
import { icons } from "@/constants/icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";

type IconProps = {
  color: string;
};

const navicons: { [key: string]: (props: IconProps) => JSX.Element } = icons;

const TabBarButton = ({
  route,
  isFocused,
  onPress,
  onLongPress,
  label,
  colors,
  options,
}: {
  onPress: Function;
  onLongPress: Function;
  label: ReactNode;
  colors: { primary: string; text: string };
  options: object;
  route: string;
  isFocused: boolean;
}) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [scale, isFocused]);

  const animatedstyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return { opacity };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    const transform = [
      { scale: interpolate(scale.value, [0, 1], [0.9, 1.1]) },
      { translateY: interpolate(scale.value, [0, 1], [0, 0]) },
    ];
    return { transform };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
    >
      <Animated.View style={animatedIconStyle}>
        {navicons[route]({
          color: isFocused ? "#fff" : colors.text,
        })}
      </Animated.View>

      {/* <Animated.Text
        style={
          isFocused
            ? [
                {
                  color: "#fff",
                  fontFamily: "Poppins-Regular",
                  fontSize: 12,
                  margin: 0,
                  padding: 0,
                },
                animatedstyle,
              ]
            : [
                {
                  color: colors.text,
                  fontFamily: "Poppins-Regular",
                  fontSize: 12,
                  margin: 0,
                  padding: 0,
                },
                animatedstyle,
              ]
        }
      >
        {typeof label === "function"
          ? label({
              focused: isFocused,
              color: isFocused ? colors.primary : colors.text,
              position: "below-icon",
              children: "",
            })
          : label}
      </Animated.Text> */}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    // backgroundColor: "red",
    padding: 10,
  },
});

export default TabBarButton;
