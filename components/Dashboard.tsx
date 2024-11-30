import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import _ from "lodash";
import { Link } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import { RefreshControl } from "react-native";

interface UserLog {
  _id: string;
  date: string;
  exerciseType: string;
  calories: number;
  duration: number;
  intensity: "LOW" | "MEDIUM" | "HIGH";
  videoUrl?: string;
  notes?: string;
}

interface Activity {
  id: string;
  name: string;
  calories: number;
  duration: number;
  intensity: string;
  videoUrl?: string;
  notes?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface UserContext {
  user: User;
  userLogs: UserLog[];
}

interface DashboardProps {
  userContext: UserContext;
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient: readonly [string, string, ...string[]];
}

const getActivityIcon = (activity: string) => {
  const icons = {
    RUNNING: "running",
    SWIMMING: "swimmer",
    YOGA: "seedling",
    CYCLING: "bicycle",
    HIIT: "heartbeat",
    STRENGTH: "dumbbell",
    default: "dumbbell",
  };
  return icons[activity as keyof typeof icons] || icons.default;
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  gradient,
}) => {
  return (
    <LinearGradient colors={gradient} style={styles.statsCard}>
      <View style={styles.statsCardContent}>
        <View>
          <Text style={styles.statsCardTitle}>{title}</Text>
          <Text style={styles.statsCardValue}>{value}</Text>
        </View>
        <MaterialCommunityIcons
          name={icon}
          size={32}
          color="rgba(255,255,255,0.8)"
        />
      </View>
    </LinearGradient>
  );
};

const FilterModal = ({
  visible,
  onClose,
  exerciseTypes,
  selectedTypes,
  onApplyFilter,
}) => {
  // Initialize tempSelectedTypes with all exercise types when the modal opens
  const [tempSelectedTypes, setTempSelectedTypes] = useState<string[]>([]);

  // Effect to set all types when modal becomes visible
  useEffect(() => {
    if (visible) {
      setTempSelectedTypes(selectedTypes);
    }
  }, [visible, selectedTypes]);

  // Handler for toggling type selection in the modal
  const onTypeChange = (type) => {
    setTempSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Handler for applying filters
  const handleApplyFilter = () => {
    // Pass the temporary selected types to the parent component
    onApplyFilter(tempSelectedTypes);
    onClose();
  };

  // Reset temporary selection when modal closes
  const handleClose = () => {
    // Reset to all types when closed
    setTempSelectedTypes(exerciseTypes);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.filterModalContainer}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter Exercises</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {exerciseTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.checkboxRow}
              onPress={() => onTypeChange(type)}
            >
              <View
                style={[
                  styles.checkbox,
                  tempSelectedTypes.includes(type) && styles.checkboxChecked,
                ]}
              >
                {tempSelectedTypes.includes(type) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{type}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilter}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ExerciseDetail = ({ exercise, visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!exercise) return null;
  const { height } = Dimensions.get("window");
  const videoHeight = height / 3;

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalDragIndicator} />
          <ScrollView style={styles.modalScrollContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{exercise.name}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.exerciseStats}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="fire" size={28} color="#f97316" />
                <Text style={styles.statValue}>{exercise.calories}</Text>
                <Text style={styles.statLabel}>Calories Burned</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="clock" size={28} color="#6b7280" />
                <Text style={styles.statValue}>{exercise.duration}m</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>
            <View style={styles.exerciseStats}>
              <View style={styles.statCard2}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={28}
                  color="#eab308"
                />
                <Text style={styles.statValue}>{exercise.intensity}</Text>
                <Text style={styles.statLabel}>Intensity</Text>
              </View>
            </View>

            {exercise.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesCard}>
                  <Text style={styles.notesText}>{exercise.notes}</Text>
                </View>
              </View>
            )}

            {exercise.videoUrl && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercise Video</Text>

                <View style={styles.videoCard}>
                  <Video
                    source={{ uri: exercise.videoUrl }}
                    useNativeControls
                    shouldPlay
                    isLooping
                    style={{
                      aspectRatio: 9 / 16,
                    }}
                    resizeMode={ResizeMode.CONTAIN}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ userContext }) => {
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Activity | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        setIsRefreshing(true);
        try {
          // Assuming userContext has a method to refresh data
          // If it doesn't, you'll need to implement this in your context
          await userContext.refreshUserData();
        } catch (error) {
          console.error("Error refreshing data:", error);
        } finally {
          setIsRefreshing(false);
        }
      };

      refreshData();
    }, [])
  );

  useEffect(() => {
    if (userContext.user) {
      userContext.setTabBarShown(true);
    }
  }, []);

  useEffect(() => {
    if (userContext.user) {
      userContext.setTabBarShown(true);
    }
  }, []);

  const userLogs = userContext.userLogs;

  const exerciseTypes = useMemo(
    () => _.uniq(userLogs.map((log) => log.exerciseType)),
    [userLogs]
  );

  useEffect(() => {
    setSelectedTypes(exerciseTypes);
  }, [exerciseTypes]);

  const stats = useMemo(() => {
    const dates = _.chain(userLogs)
      .groupBy((log) => new Date(log.date).toISOString().split("T")[0])
      .keys()
      .sortBy()
      .reverse()
      .value();

    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      if (i !== 0) {
        expectedDate.setDate(expectedDate.getDate() - i);
      }

      if (dates[i] === expectedDate.toISOString().split("T")[0]) {
        currentStreak++;
      } else break;
    }

    let presentmonthworkout = 0;
    for (let i = 0; i < dates.length; i++) {
      const presentMonthandyear = new Date()
        .toISOString()
        .split("T")[0]
        .slice(0, 7);

      if (dates[i].slice(0, 7) === presentMonthandyear) {
        presentmonthworkout++;
      } else break;
    }

    return {
      totalCalories: _.sumBy(userLogs, "calories"),
      streak: currentStreak,
      monthlyWorkouts: presentmonthworkout,
    };
  }, [userLogs]);

  const handleApplyFilter = (newSelectedTypes) => {
    // Actually apply the filter
    setSelectedTypes(newSelectedTypes);
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const filteredWorkouts = useMemo(() => {
    let filtered = userLogs;

    if (dateFilter) {
      filtered = filtered.filter(
        (log) => new Date(log.date).toDateString() === dateFilter.toDateString()
      );
    }

    filtered = filtered.filter((log) =>
      selectedTypes.includes(log.exerciseType)
    );

    const grouped = _.groupBy(
      filtered,
      (log) => new Date(log.date).toISOString().split("T")[0]
    );

    return Object.entries(grouped)
      .map(([date, logs]) => ({
        date: formatDate(new Date(date)),
        rawDate: date,
        activities: logs
          .map((log) => ({
            id: log._id,
            name: log.exerciseType,
            calories: log.calories,
            duration: log.duration,
            intensity: log.intensity,
            videoUrl: log.videoUrl,
            notes: log.notes,
            date: log.date,
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
      }))
      .sort(
        (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      );
  }, [userLogs, dateFilter, selectedTypes]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={async () => {
            setIsRefreshing(true);
            try {
              await userContext.refreshUserData();
            } finally {
              setIsRefreshing(false);
            }
          }}
        />
      }
      style={styles.scrollView}
    >
      <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Welcome back, {userContext.user.name.split(" ")[0]}! 💪
          </Text>
          <Text style={styles.headerSubtitle}>Ready for today's workout?</Text>
        </View>
        <Link href="/(tabs)/logger">
          <View
            style={styles.startButton}
            // onPress={() => console.log("logger")}
          >
            <Text style={styles.startButtonText}>Log Today's Workout</Text>
            <Feather name="chevron-right" size={20} color="#2563eb" />
          </View>
        </Link>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <StatsCard
          title="Total Calories"
          value={stats.totalCalories}
          icon="fire"
          gradient={["#f97316", "#ea580c"]}
        />
        <StatsCard
          title="Workout Streak"
          value={`${stats.streak} days`}
          icon="trophy"
          gradient={["#a855f7", "#9333ea"]}
        />
        <StatsCard
          title={`${new Date().toLocaleString("default", {
            month: "long",
          })} Workouts`}
          value={stats.monthlyWorkouts}
          icon="calendar"
          gradient={["#22c55e", "#16a34a"]}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Workout History</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                dateFilter && styles.filterButtonActive,
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.filterButtonContent}>
                <Feather
                  name="calendar"
                  size={20}
                  color={dateFilter ? "#2563eb" : "#6b7280"}
                />
                {dateFilter && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setDateFilter(null);
                    }}
                    style={styles.clearFilterButton}
                  >
                    <Ionicons name="close-circle" size={16} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedTypes.length < exerciseTypes.length &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setShowFilterModal(true)}
            >
              <Feather
                name="filter"
                size={20}
                color={
                  selectedTypes.length < exerciseTypes.length
                    ? "#2563eb"
                    : "#6b7280"
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {filteredWorkouts.map((day, idx) => (
          <View key={idx} style={styles.workoutDay}>
            <Text style={styles.dayHeader}>{day.date}</Text>
            {day.activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCard}
                onPress={() => setSelectedExercise(activity)}
                activeOpacity={0.9}
              >
                <View style={styles.activityLeft}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5
                      name={getActivityIcon(activity.name)}
                      size={16}
                      color="#2563eb"
                    />
                  </View>
                  <View>
                    <Text style={styles.activityName}>{activity.name}</Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <View style={styles.activityStat}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={16}
                      color="#f97316"
                    />
                    <Text style={styles.caloriesText}>{activity.calories}</Text>
                  </View>
                  <View style={styles.activityStat}>
                    <Feather name="clock" size={16} color="#6b7280" />

                    <Text style={styles.activityMeta}>
                      {activity.duration}m
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dateFilter || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === "set" && selectedDate) {
              setDateFilter(selectedDate);
            }
          }}
        />
      )}

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        exerciseTypes={exerciseTypes}
        selectedTypes={selectedTypes}
        onApplyFilter={handleApplyFilter}
      />

      <ExerciseDetail
        exercise={selectedExercise}
        visible={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 32,
    padding: 24,
    paddingTop: 48,
    // paddingTop: Platform.OS === "ios" ? 48 : 24,
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
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#bfdbfe",
    fontSize: 16,
  },
  startButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  startButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    marginRight: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  statsCard: {
    flex: 1,
    minWidth: "30%",
    borderRadius: 12,
    padding: 16,
  },
  statsCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsCardTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginBottom: 4,
  },
  statsCardValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 100,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    // paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  filterButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: "#dbeafe",
  },
  clearFilterButton: {
    marginLeft: 4,
  },
  workoutDay: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 16,
    marginBottom: 16,
    // paddingHorizontal: 4,
  },

  dayHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  activityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  activityName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  activityMeta: {
    fontSize: 14,
    color: "#6b7280",
  },
  activityRight: {
    flexDirection: "row",

    gap: 16,
  },
  activityStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f97316",
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    maxHeight: "70%",
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#374151",
  },
  applyButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "60%",
    maxHeight: "90%",
    paddingTop: 12,
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalScrollContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  closeButton: {
    padding: 4,
  },
  exerciseStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "50%",
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statCard2: {
    width: "100%",
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginVertical: 8,
    // textTransform: "capitalize",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  notesCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
  },
  videoCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  videoCardContent: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoCardText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2563eb",
  },
  previewVideo: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export default Dashboard;
