import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { TextInput as PaperInput } from "react-native-paper";
import API_BASE_URL from "../../config";
export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  const handleRegister = async () => {
    try {
        await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password, address });
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "You can now log in!",
      });
      navigation.navigate("Login");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: err.response?.data?.error || "Something went wrong",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <PaperInput label="Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
      <PaperInput label="Email" value={email} onChangeText={setEmail} style={styles.input} mode="outlined" keyboardType="email-address" />
      <PaperInput label="Password" value={password} onChangeText={setPassword} style={styles.input} mode="outlined" secureTextEntry />
      <PaperInput label="Address" value={address} onChangeText={setAddress} style={styles.input} mode="outlined" />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    marginBottom: 20,
    color: "#6200EE",
  },
  input: {
    width: "100%",
    marginBottom: 15,
  },
  button: {
    width: "100%",
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
  link: {
    marginTop: 15,
    color: "#6200EE",
    fontSize: 14,
    fontWeight: "500",
  },
});
