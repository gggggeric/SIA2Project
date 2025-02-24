import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// Import Screens
import LoginScreen from "./src/authentication/LoginScreen";
import RegisterScreen from "./src/authentication/RegisterScreen";
import HomeScreen from "./src/home/homeScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ Bottom Tabs for Authentication (Login & Register)
function AuthTabs() {
  return (
    <Tab.Navigator screenOptions={authTabOptions}>
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Register" component={RegisterScreen} />
    </Tab.Navigator>
  );
}

// ✅ Custom Tab Bar Options for Authentication
const authTabOptions = ({ route }) => ({
  tabBarIcon: ({ color, size }) => {
    let iconName = route.name === "Login" ? "log-in-outline" : "person-add-outline";
    return <Ionicons name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: "#6200EE",
  tabBarInactiveTintColor: "gray",
  headerShown: false,
});

// ✅ Stack Navigator for Screen Management
export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthTabs" component={AuthTabs} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
