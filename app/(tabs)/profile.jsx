import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { useGlobalContext } from "@/context/GlobalProvider";
import { updateUser, getCurrentUser } from "@/lib/userFunctions";
import BMIIndicator from "@/components/BMIIndicator";
import DetailCard from "@/components/DetailCard"; // Import the new DetailCard component

const { width } = Dimensions.get("window");
const cardWidth = (width - 48 - 16) / 2;

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "User Name",
    age: 28,
    weight: 75,
    height: 180,
    targetWeight: 70,
  });

  const userContext = useGlobalContext();
  const userData = userContext.user;

  useEffect(() => {
    if (userContext.user) {
      userContext.setTabBarShown(true);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.name,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        targetWeight: userData.targetWeight,
      });
    }
  }, [userData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const userObject = await updateUser(profile, userData._id);
    if (userObject._id) {
      const getData = await getCurrentUser();
      userContext.setUser(getData);
      setIsEditing(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="user" size={48} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                value={profile.name}
                onChangeText={(text) => handleChange("name", text)}
                style={styles.nameInput}
                placeholderTextColor="#ffffff80"
              />
            ) : (
              <Text style={styles.nameText}>{profile.name}</Text>
            )}
            <Text style={styles.subtitleText}>Personal Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={isEditing ? handleSave : handleEdit}
          >
            <Icon name={isEditing ? "save" : "edit-2"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardGrid}>
          <DetailCard
            icon="calendar"
            label="Age"
            value={profile.age}
            onEdit={(value) => handleChange("age", value)}
            unit="years"
            isEditing={isEditing}
          />
          <DetailCard
            icon="weight"
            label="Current Weight"
            value={profile.weight}
            onEdit={(value) => handleChange("weight", value)}
            unit="kg"
            isEditing={isEditing}
          />
          <DetailCard
            icon="human-male-height-variant"
            label="Height"
            value={profile.height}
            onEdit={(value) => handleChange("height", value)}
            unit="cm"
            isEditing={isEditing}
          />
          <DetailCard
            icon="target"
            label="Target Weight"
            value={profile.targetWeight}
            onEdit={(value) => handleChange("targetWeight", value)}
            unit="kg"
            isEditing={isEditing}
          />
        </View>
        <BMIIndicator weight={profile.weight} height={profile.height} />
      </ScrollView>
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

export default ProfilePage;
