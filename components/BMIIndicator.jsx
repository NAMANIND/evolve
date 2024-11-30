import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";

const BMIIndicator = ({ weight, height }) => {
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
  const bmiPercentage = (bmi / 40) * 100;

  return (
    <View style={styles.bmiContainer}>
      <LinearGradient
        colors={["#1d4ed81a", "transparent"]}
        style={styles.bmiGradient}
      />
      <View style={styles.bmiHeader}>
        <View style={styles.bmiIconContainer}>
          <Icon name="activity" size={20} color="#fff" />
        </View>
        <Text style={styles.bmiTitle}>BMI Calculator</Text>
      </View>
      <View style={styles.bmiValueContainer}>
        <Text style={styles.bmiValue}>{bmi}</Text>
        <Text style={styles.bmiUnit}>kg/m²</Text>
      </View>
      <View style={styles.bmiBarContainer}>
        <LinearGradient
          colors={["#4ADE80", "#FACC15", "#EF4444"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bmiBar}
        >
          <View
            style={[
              styles.bmiIndicator,
              { left: `${Math.min(Math.max(bmiPercentage, 0), 100)}%` },
            ]}
          />
        </LinearGradient>
      </View>
      <View style={styles.bmiLabels}>
        <Text style={styles.bmiLabel}>Underweight</Text>
        <Text style={styles.bmiLabel}>Normal</Text>
        <Text style={styles.bmiLabel}>Overweight</Text>
        <Text style={styles.bmiLabel}>Obese</Text>
      </View>
    </View>
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
    // width: cardWidth,
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
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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

export default BMIIndicator;
