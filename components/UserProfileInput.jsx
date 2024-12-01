import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getCurrentUser, updateUser } from "@/lib/userFunctions";

const UserProfileInput = ({ userContext }) => {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleButtonClick = async () => {
    setSubmitting(true);
    const userData = {
      name,
      weight: parseFloat(weight),
      age: parseInt(age),
      height: parseFloat(height),
      targetWeight: parseFloat(targetWeight),
    };

    updateUser(userData)
      .then((userObject) => {
        if (userObject._id) {
          getCurrentUser().then((getdata) => {
            userContext.setUser(getdata);
          });
        } else {
          // Log or perform an action with the userData
          console.log("User Data Submitted:", userObject);
          Alert.alert(
            "User Data Submitted",
            JSON.stringify(userObject, null, 2)
          );
        }
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter User Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        value={weight}
        keyboardType="numeric"
        onChangeText={setWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        keyboardType="numeric"
        onChangeText={setAge}
      />
      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        value={height}
        keyboardType="numeric"
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Target Weight (kg)"
        value={targetWeight}
        keyboardType="numeric"
        onChangeText={setTargetWeight}
      />

      <Button
        title={submitting ? "Submitting..." : "Submit"}
        onPress={handleButtonClick}
        disabled={submitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default UserProfileInput;
