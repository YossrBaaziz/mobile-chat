import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import firebase from "../Config";
import AsyncStorage from "@react-native-async-storage/async-storage"; //remember me
import { initiateConnectionMonitor, modifyConnectionStatus, useUser } from "../context";

const auth = firebase.auth();

export default function Auth({ navigation }) {
  const [email, setEmail] = useState("yossr@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);//Indicates whether a login or auto-login is in progress.
  const [rememberMe, setRememberMe] = useState(false);
  const {user,setCurrentUser}=useUser()
  useEffect(() => {  //check if stored credentials exist.
    const autoLogin = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("email");
        const savedPassword = await AsyncStorage.getItem("password");
        if (savedEmail && savedPassword) {
          setLoading(true);
          auth
            .signInWithEmailAndPassword(savedEmail, savedPassword)
            .then(() => {
              setLoading(false);
              navigation.replace("Home");
            })
            .catch((error) => {
              setLoading(false);
              console.error("Auto-login failed", error);
            });
        }
      } catch (error) {
        console.error("Error checking stored credentials", error);
      }
    };
    autoLogin();
  }, []);

  const handleLogin = async () => { //Manual Login
    if (!email.trim() || !password.trim()) {
      Alert.alert("Input Error", "Please fill in both email and password.");
      return;
    }

    setLoading(true);

    auth
      .signInWithEmailAndPassword(email, password)//Calls firebase.auth().signInWithEmailAndPassword to log in.
      .then(async (userCredential) => {
        setLoading(false);
        if (rememberMe) {
          try {
            await AsyncStorage.setItem("email", email);//Saves or removes credentials in AsyncStorage based on the rememberMe state.
            await AsyncStorage.setItem("password", password);
          } catch (error) {
            console.error("Failed to save credentials", error);
          }
        } else {
          try {
            await AsyncStorage.removeItem("email");
            await AsyncStorage.removeItem("password");
          } catch (error) {
            console.error("Failed to clear credentials", error);
          }
        }
        let uid = userCredential?.user?.uid
        setCurrentUser({
          uid:uid,
          email:  userCredential?.user?.email,
        });

        initiateConnectionMonitor(uid);
        modifyConnectionStatus(uid, 'online');

        navigation.replace("Home");
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert("Login Failed", error.message);
      });
  };

  const toggleRememberMe = () => setRememberMe(!rememberMe);

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.container}
    >
      <StatusBar style="auto" />
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Bienvenue</Text>

        <TextInput
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="black"
          value={email}
          onChangeText={setEmail}
          style={styles.textInput}
          accessible
          accessibilityLabel="Email Input"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.textInput}
          accessible
          accessibilityLabel="Password Input"
        />

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={toggleRememberMe} style={styles.checkbox}>
            <View
              style={[
                styles.checkboxInner,
                rememberMe && styles.checkboxChecked,
              ]}
            />
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Remember Me</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => navigation.goBack()}
            accessible
            accessibilityLabel="Exit Button"
          >
            <Text style={styles.buttonText}>Exit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            accessible
            accessibilityLabel="Submit Button"
          >
            <Text style={styles.buttonText}>
              {loading ? "Loading..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("NewUser")}
          accessible
          accessibilityLabel="Create New User Link"
        >
          <Text style={styles.newUserText}>Create new user</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#0007",
    height: 400,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    gap: 10,
    padding: 20,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#fff",
    marginBottom: 20,
  },
  textInput: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: "black",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#4CAF50",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
    alignItems: "center",
  },
  exitButton: {
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  newUserText: {
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontStyle: "italic",
    marginTop: 15,
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
