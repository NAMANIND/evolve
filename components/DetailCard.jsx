import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = (width - 34 - 16) / 2;

const DetailCard = ({ icon, label, value, onEdit, unit, isEditing }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animateCard = (toValue) => {
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => animateCard(0.95)}
      onPressOut={() => animateCard(1)}
    >
      <Animated.View
        style={[styles.detailCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <LinearGradient
          colors={["#2563eb1a", "transparent"]}
          style={styles.cardGradient}
        />
        <MaterialCommunityIcons name={icon} size={24} color="#2563eb" />
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={styles.valueContainer}>
          {isEditing ? (
            <View style={styles.inputContainer}>
              <TextInput
                value={String(value)}
                onChangeText={(text) => onEdit(parseInt(text) || 0)}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#A1A1AA"
              />
              <Text style={styles.unit}>{unit}</Text>
            </View>
          ) : (
            <View style={styles.valueWrapper}>
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.unit}>{unit}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  nameInput: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 8,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
  },
  content: {
    flex: 1,
    padding: 16,
    marginVertical: 16,
    gap: 16,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailCard: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 128,
    height: 128,
    borderBottomLeftRadius: 128,
  },
  cardLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  valueWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingVertical: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  unit: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1d4ed81a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    width: 60,
  },
  bmiContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    overflow: "hidden",
  },
  bmiGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 192,
    height: 192,
    borderBottomLeftRadius: 192,
  },
  bmiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  bmiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  bmiValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
  },
  bmiUnit: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
  },
  bmiBarContainer: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  bmiBar: {
    height: "100%",
    width: "100%",
  },
  bmiIndicator: {
    position: "absolute",
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#3B82F6",
    marginLeft: -8,
    top: -4,
  },
  bmiLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  bmiLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default DetailCard;
