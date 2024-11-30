import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const CircularProgress = ({ steps, totalSteps, selectedExercise }) => {
  const radius = 115; // Radius of the circle
  const strokeWidth = 8; // Width of the circle stroke
  const circumference = 2 * Math.PI * radius; // Total circumference
  const progress = (steps / totalSteps) * 100; // Calculate progress percentage
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.linear,
    });

    // Using withSpring for a spring animation effect
    animatedValue.value = withSpring(progress, {
      overshootClamping: progress > 90 ? true : false,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = (1 - animatedValue.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.container}>
      <Svg height={250} width={250}>
        {/* Background Circle */}
        <Circle
          cx="125"
          cy="125"
          r={radius}
          stroke="#e6e6e6" // Background color
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx="125"
          cy="125"
          r={radius}
          stroke={selectedExercise ? selectedExercise.color : "#3b82f6"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round" // Makes the edges round
          transform={`rotate(90, 125, 125)`} // Rotate the circle to start from the top
        />
      </Svg>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    // Center the CircularProgress component
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CircularProgress;
