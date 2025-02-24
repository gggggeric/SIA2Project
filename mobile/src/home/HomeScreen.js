import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

export default function HomeScreen({ navigation }) {
    const handleLogout = () => {
        Toast.show({
          type: "info",
          text1: "Logged Out",
          text2: "You have been logged out.",
        });
      
        // ✅ Reset navigation back to AuthTabs (Login & Register)
        navigation.reset({
          index: 0,
          routes: [{ name: "AuthTabs" }],
        });
      };
      
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>You are successfully logged in.</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Toast Notification */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#6200EE",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#6200EE",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
