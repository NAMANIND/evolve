import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, SafeAreaView } from "react-native";

import { useGlobalContext } from "@/context/GlobalProvider";
import UserProfileInput from "@/components/UserProfileInput";
import Dashboard from "@/components/Dashboard";

// Stats Card Component

// Dashboard Page Component

// Training Page Component

// Main App Component
const Index: React.FC = () => {
  const userContext = useGlobalContext();

  if (userContext.loading) {
    // Show a loading indicator while fetching user data
    return <SafeAreaView style={styles.container}></SafeAreaView>;
  }

  if (userContext.user) {
    // Show Dashboard if user exists
    return (
      <SafeAreaView style={styles.container}>
        <Dashboard userContext={userContext} />
      </SafeAreaView>
    );
  }

  // Show UserProfileInput if no user exists
  return <UserProfileInput userContext={userContext} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
});

export default Index;
