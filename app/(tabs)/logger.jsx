import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
  BackHandler,
} from "react-native";

import CircularProgress from "../../components/CircularProgress";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Video, Audio } from "expo-av";
import { uploadExerciseVideo, addExerciseLog } from "@/lib/userFunctions";
import { ActivityIndicator } from "react-native";
const { width } = Dimensions.get("window");

const exerciseTypes = [
  {
    icon: "🏃",
    name: "RUNNING",
    color: "#f97316",
    caloriesPerMinute: {
      light: 8,
      moderate: 10,
      intense: 14,
    },
  },
  {
    icon: "🏋️",
    name: "STRENGTH",
    color: "#a855f7",
    caloriesPerMinute: {
      light: 6,
      moderate: 8,
      intense: 11,
    },
  },
  {
    icon: "🧘",
    name: "YOGA",
    color: "#22c55e",
    caloriesPerMinute: {
      light: 3,
      moderate: 5,
      intense: 7,
    },
  },
  {
    icon: "🚴",
    name: "CYCLING",
    color: "#3b82f6",
    caloriesPerMinute: {
      light: 7,
      moderate: 9,
      intense: 13,
    },
  },
  {
    icon: "🏊",
    name: "SWIMMING",
    color: "#06b6d4",
    caloriesPerMinute: {
      light: 8,
      moderate: 11,
      intense: 15,
    },
  },
  {
    icon: "⚡",
    name: "HIIT",
    color: "#ef4444",
    caloriesPerMinute: {
      light: 10,
      moderate: 12,
      intense: 16,
    },
  },
];

const durationPresets = [5, 10, 15, 20, 30];

const intensityLevels = [
  {
    name: "LIGHT",
    key: "light",
    iconColor: "#22c55e",
    description: "Comfortable pace, can easily hold conversation",
    backgroundColor: "#dcfce7",
    textColor: "#15803d",
  },
  {
    name: "MODERATE",
    key: "moderate",
    iconColor: "#f97316",
    description: "Challenging but sustainable",
    backgroundColor: "#ffedd5",
    textColor: "#c2410c",
  },
  {
    name: "INTENSE",
    key: "intense",
    iconColor: "#ef4444",
    description: "High effort, limited conversation",
    backgroundColor: "#fee2e2",
    textColor: "#b91c1c",
  },
];

const FitnessTracker = () => {
  // All states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [duration, setDuration] = useState(0);
  const [intensity, setIntensity] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calories, setCalories] = useState(0);

  // Camera and video states
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [videoUri, setVideoUri] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const userContext = useGlobalContext();
  const cameraRef = useRef(null);
  const timerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const [flag, setFlag] = useState(false);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // useEffect(() => {
  //   if (showCamera) {
  //     console.log("canera");
  //     startRecording();
  //   }
  // }, [showCamera]);

  useEffect(() => {
    const handleBackPress = () => {
      // Prevent default behavior
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, []);

  // Permission handling
  const requestPermissions = async () => {
    try {
      const cameraStatus = await requestPermission();
      const audioStatus = await Audio.requestPermissionsAsync();

      if (cameraStatus.granted && audioStatus.granted) {
        setHasAudioPermission(true);
        return true;
      } else {
        Alert.alert(
          "Permissions Required",
          "Camera and microphone permissions are needed to record videos.",
          [{ text: "OK" }]
        );
        return false;
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  const calculateCalories = (intensityLevel) => {
    if (!selectedExercise || !duration) return 0;
    return Math.round(
      selectedExercise.caloriesPerMinute[intensityLevel] * duration
    );
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(2);
  };

  const handleDurationSelect = (mins) => {
    setDuration(mins);
    setCurrentStep(3);
  };

  const handleIntensitySelect = (level) => {
    setIntensity(level);
    setCurrentStep(4);
  };
  // Recording functions
  const startCountdown = () => {
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowCamera(true);
          clearInterval(timerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    if (!cameraRef.current) {
      console.error("Camera reference not found");
      return;
    }

    if (flag) {
      return;
    }

    setFlag(true);
    setIsRecording(true);
    setRecordingTime(0);

    const sec = 5;

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        console.log("Recording time:", prev + 1);

        if (prev >= sec) {
          console.log("Automatically stopping recording after 60 seconds");
          clearInterval(recordingTimerRef.current);

          // Add a delay before stopping to ensure the camera state is stable
          setTimeout(() => {
            stopRecording();
          }, 100);

          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const options = {
        maxDuration: sec,
        mute: !hasAudioPermission,
        VideoQuality: "480p",
      };

      const promise = cameraRef.current.recordAsync(options);
      cameraRef.current.recordPromise = promise; // Store the promise for later

      const recordedVideo = await promise;

      // console.log("Recording completed:", recordedVideo);
      // console.log("Video URI:", recordedVideo.uri);

      if (recordedVideo?.uri) {
        setVideoUri(recordedVideo.uri);
        setShowPreview(true);
        setShowCamera(false);
      }

      setIsRecording(false);
    } catch (error) {
      console.error("Error during recording:", error);
      setIsRecording(false);
    } finally {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");

    if (!cameraRef.current) {
      console.error("Camera reference not found during stopRecording");
      return;
    }

    if (!isRecording) {
      console.log("No active recording to stop");
      return;
    }
    setFlag(false);

    try {
      await cameraRef.current.stopRecording();
      console.log("Stop recording command sent");

      const recordedVideo = await cameraRef.current.recordPromise;

      console.log("Recording stopped successfully:", recordedVideo);
      setIsRecording(false);
      if (recordedVideo?.uri) {
        console.log("Setting video URI:", recordedVideo.uri);
        setVideoUri(recordedVideo.uri);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    } finally {
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }
  };

  const handleStartRecording = async () => {
    if (currentStep !== 4) return;

    const hasPermissions = await requestPermissions();
    if (hasPermissions) {
      startCountdown();
    }
  };

  const handleReRecord = () => {
    setVideoUri(null);
    setShowPreview(false);
    setShowCamera(true);
    setShowCamera(false);
    setIsRecording(false);
    setShowPreview(false);
    setRecordingTime(0);
    setFlag(false);
  };

  const handleAcceptVideo = () => {
    var S3videoUrl;
    setShowPreview(false);
    setSubmitting(true);

    uploadExerciseVideo(videoUri)
      .then((res) => {
        if (res.videoUrl) {
          S3videoUrl = res.videoUrl;

          const logData = {
            date: date.toISOString(),
            exerciseType: selectedExercise.name,
            duration: duration,
            intensity: intensity.name,
            calories: calories,
            videoUrl: S3videoUrl,
          };

          const userId = userContext.user._id;

          addExerciseLog(userId, logData)
            .then((updatedlogs) => {
              // userContext.setUserLogs(updatedlogs);
              console.log("Workout logged:", updatedlogs);
              Alert.alert("Success", "Workout recorded successfully!");
              // Reset states

              setShowCamera(false);
              setIsRecording(false);
              setRecordingTime(0);
              setFlag(false);
              setVideoUri(null);
              setShowPreview(false);
              setCurrentStep(1);
              setSelectedExercise(null);
              setDuration(0);
              setIntensity(null);
              setCalories(0);
              setSubmitting(false);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const cancelRecording = () => {
    setFlag(false);
    setVideoUri(null);
    setShowCamera(false);
    setIsRecording(false);
    setRecordingTime(0);
    setCountdown(null);
    setCurrentStep(currentStep - 1);
  };
  const scale = useSharedValue(0);

  const animatedIconStyle = useAnimatedStyle(() => {
    const transform = [
      { scale: interpolate(scale.value, [0, 1], [1, 1.2]) },
      { translateY: interpolate(scale.value, [0, 1], [0, 100]) },
    ];
    const progressColor = selectedExercise?.color ?? "#3b82f6";
    return {
      transform,
      backgroundColor: scale.value === 1 ? progressColor : "white",
    };
  });

  useEffect(() => {
    if (userContext.user) {
      const isFirstStep = currentStep === 1;
      userContext.setTabBarShown(isFirstStep);
    }

    scale.value = withSpring(currentStep === 4 ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
  }, [currentStep]);
  // Render methods
  const renderProgressCircle = () => {
    return (
      <View style={styles.progressCircleContainer}>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Log Today's Workout 🏋️‍♂️</Text>
            <Text style={styles.headerSubtitle}>
              {date.toDateString() === new Date().toDateString()
                ? "Ready for today's activity?"
                : `Log your activity for ${date.toDateString()}`}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {date.toDateString() === new Date().toDateString()
                ? "Today's Activity"
                : date.toDateString()}
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Feather name="calendar" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <TouchableWithoutFeedback onPress={handleStartRecording}>
          <Animated.View style={[styles.progressCircle, animatedIconStyle]}>
            <View style={styles.progressCircleInner}>
              <CircularProgress
                selectedExercise={selectedExercise}
                steps={currentStep}
                totalSteps={4}
              />

              <View style={styles.circleContent}>
                {countdown !== null ? (
                  <Text style={styles.countdownText}>{countdown}</Text>
                ) : currentStep === 4 ? (
                  <View style={styles.recordButton}>
                    <Ionicons name="camera" size={48} color="white" />
                    <Text style={styles.recordText}>
                      {isRecording ? "Recording..." : "Start Recording"}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.stepIndicator}>
                    <Text style={styles.stepNumber}>{currentStep}/4</Text>
                    <Text style={styles.stepText}>
                      {currentStep === 1
                        ? "Choose Exercise"
                        : currentStep === 2
                        ? "Set Duration"
                        : "Set Intensity"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const renderExerciseGrid = () => (
    <View style={styles.exerciseGrid}>
      {exerciseTypes.map((exercise) => (
        <TouchableOpacity
          key={exercise.name}
          onPress={() => handleExerciseSelect(exercise)}
          style={[styles.exerciseButton, { backgroundColor: exercise.color }]}
        >
          <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDurationOptions = () => (
    <View style={styles.durationContainer}>
      {durationPresets.map((mins) => (
        <TouchableOpacity
          key={mins}
          onPress={() => handleDurationSelect(mins)}
          style={styles.durationButton}
        >
          <Text style={styles.durationText}>{mins} min</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderIntensityOptions = () => (
    <ScrollView style={styles.intensityContainer}>
      {intensityLevels.map((level) => {
        const calories = calculateCalories(level.key);
        return (
          <TouchableOpacity
            key={level.name}
            onPress={() => {
              handleIntensitySelect(level);
              setCalories(calories);
            }}
            style={[
              styles.intensityButton,
              { backgroundColor: level.backgroundColor },
            ]}
          >
            <View style={styles.intensityContent}>
              <Ionicons name="flame" size={32} color={level.iconColor} />
              <View style={styles.intensityTextContainer}>
                <Text
                  style={[styles.intensityName, { color: level.textColor }]}
                >
                  {level.name}
                </Text>
                <Text style={styles.intensityDescription}>
                  {level.description}
                </Text>
              </View>
              <View style={styles.caloriesContainer}>
                <Text
                  style={[styles.caloriesNumber, { color: level.textColor }]}
                >
                  {calories}
                </Text>
                <Text style={styles.caloriesText}>calories</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
  // Main render method
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {showCamera ? (
        <View style={{ flex: 1 }}>
          <CameraView
            ref={cameraRef}
            facing={facing}
            mode="video"
            mirror={facing === "front"}
            style={{ flex: 1 }}
            focusable
            autofocus="on"
            onCameraReady={startRecording}
          >
            <View style={styles.cameraControls}>
              {!countdown && !isRecording && (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={startCountdown}
                >
                  <Text style={styles.recordButtonText}>Start Recording</Text>
                </TouchableOpacity>
              )}

              {isRecording && (
                <View style={styles.timerContainer}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.timerText}>
                    {`${Math.floor(recordingTime / 60)}:${(recordingTime % 60)
                      .toString()
                      .padStart(2, "0")}`}
                  </Text>
                </View>
              )}

              <View style={styles.cameraButtons}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={cancelRecording}
                >
                  <Feather name="x" size={24} color="#fff" />
                  <Text style={styles.cameraButtonText}>Cancel</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() =>
                    setFacing((current) =>
                      current === "back" ? "front" : "back"
                    )
                  }
                >
                  <Feather name="refresh-cw" size={24} color="#fff" />
                  <Text style={styles.cameraButtonText}>Flip</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </CameraView>
        </View>
      ) : videoUri && showPreview ? (
        // Preview Screen
        <View style={styles.container}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              onPress={handleReRecord}
              style={styles.previewButton}
            >
              <Feather name="rotate-ccw" size={20} color="#000" />
              <Text style={styles.previewButtonText}>Re-record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAcceptVideo}
              style={[styles.previewButton, styles.acceptButton]}
            >
              <Feather name="check" size={20} color="#fff" />
              <Text style={[styles.previewButtonText, styles.acceptButtonText]}>
                Accept
              </Text>
            </TouchableOpacity>
          </View>

          <Video
            source={{ uri: videoUri }}
            style={styles.previewVideo}
            useNativeControls
            shouldPlay
            isLooping
            resizeMode="contain"
          />
        </View>
      ) : submitting ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 32,
              borderRadius: 20,
              alignItems: "center",
              width: "85%",
              maxWidth: 320,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#f0f9ff",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <MaterialCommunityIcons
                name="rocket-launch"
                size={30}
                color="#0284c7"
              />
            </View>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: 8,
              }}
            >
              Almost There!
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Preparing your submission
            </Text>

            <ActivityIndicator size="large" color="#0284c7" />
          </View>
        </View>
      ) : (
        // Normal Flow
        <ScrollView
          style={[
            styles.container,
            currentStep !== 1 ? { marginBottom: 60 } : null,
          ]}
        >
          {renderProgressCircle()}
          <View style={styles.content}>
            {currentStep === 1 && renderExerciseGrid()}
            {currentStep === 2 && renderDurationOptions()}
            {currentStep === 3 && renderIntensityOptions()}
          </View>
        </ScrollView>
      )}

      {selectedExercise && !showCamera && !videoUri && currentStep !== 1 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryIcon}>{selectedExercise.icon}</Text>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryTitle}>{selectedExercise.name}</Text>
              <Text style={styles.summaryDetails}>
                {duration > 0 && `${duration} min`}
                {intensity && ` • ${intensity.name}`}
              </Text>
            </View>
          </View>
          {intensity && (
            <View style={styles.summaryRight}>
              <Ionicons name="flame" size={24} color={intensity.iconColor} />
              <Text style={styles.summaryCalories}>
                {calculateCalories(intensity.key)} cal
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={{
              padding: 4,
            }}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <MaterialCommunityIcons
              name="undo-variant"
              size={28}
              color="#000"
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    position: "relative",
  },
  // Camera styles
  cameraControls: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: 20,
  },
  submmitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: 120,
    color: "white",
    fontWeight: "bold",
  },
  timerContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  timerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  cameraButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },

  // Preview styles
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    gap: 8,
  },
  previewButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  acceptButton: {
    backgroundColor: "#2563eb",
  },
  acceptButtonText: {
    color: "#fff",
  },
  previewVideo: {
    flex: 1,
    backgroundColor: "#000",
  },

  progressCircleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircleInner: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 120,
  },
  circleContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  stepIndicator: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#6b7280",
  },
  recordButton: {
    alignItems: "center",
  },
  recordText: {
    color: "white",
    marginTop: 8,
    fontSize: 14,
  },
  exerciseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 100,
  },
  exerciseButton: {
    width: (width - 48) / 2,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  exerciseIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  exerciseName: {
    color: "white",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  durationButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "white",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  durationText: {
    fontSize: 18,
  },
  intensityContainer: {
    flex: 1,
  },
  intensityButton: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  intensityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  intensityTextContainer: {
    flex: 1,
  },
  intensityName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  intensityDescription: {
    fontSize: 14,
    color: "#4b5563",
  },
  caloriesContainer: {
    alignItems: "flex-end",
  },
  caloriesNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  caloriesText: {
    fontSize: 14,
    color: "#4b5563",
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    zIndex: 5,
    width: "100%",
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  summaryIcon: {
    fontSize: 32,
  },
  summaryTextContainer: {
    gap: 4,
  },
  summaryTitle: {
    fontWeight: "500",
    // textTransform: "capitalize",
  },
  summaryDetails: {
    fontSize: 14,
    color: "#6b7280",
    // textTransform: "capitalize",
  },
  summaryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryCalories: {
    fontWeight: "500",
  },
  header: {
    marginBottom: 24,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    width: "100%",
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#bfdbfe",
    fontSize: 16,
  },
  dateContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "white",
    marginRight: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
});

export default FitnessTracker;
