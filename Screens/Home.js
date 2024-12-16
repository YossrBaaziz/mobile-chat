import React, { useEffect, useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import ListProfils from "./Home/ListProfils";
import Groupes from "./Home/Groupes";
import MyProfil from "./Home/MyProfil";
import Icon from "react-native-vector-icons/MaterialIcons";
import firebase from "../Config";
import { useUser } from "../context";

const database = firebase.database();
const ref_tableProfils = database.ref("ProfilsTable");
const Tab = createMaterialBottomTabNavigator();

export default function Home(props) {
  const theme = useColorScheme();
  const tabBarBackgroundColor = theme === "dark" ? "#333" : "#f8f8f8";
const {user,setCurrentUser}=useUser()
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      if (!authUser) {
        props.navigation.replace("Auth");
      }
    });
    return () => unsubscribe();
  }, []);

  
  const userId = firebase.auth().currentUser.uid;

  useEffect(() => {
    const userProfileRef = ref_tableProfils.child(`Profil${userId}`);
    userProfileRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentUser(data)
      }
    });

    return () => userProfileRef.off();
  }, []);

  console.log({user})

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let iconSize = focused ? 30 : 24;
          if (route.name === "ListProfils") iconName = "list";
          if (route.name === "Groupes") iconName = "group";
          if (route.name === "MyProfile") iconName = "person";
          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: tabBarBackgroundColor },
      })}
      
    >
      <Tab.Screen
        name="MyProfile"
        component={MyProfil}
        options={{ accessibilityLabel: "My Profile tab" }}
      />
      <Tab.Screen
        name="ListProfils"
        listeners={{
          tabPress: e => {
            // Prevent default action
            if(!user) e.preventDefault();
          },
        }}
        component={ListProfils}
        options={{ accessibilityLabel: "Profiles tab" }}
      />
      <Tab.Screen
        name="Groupes"
        component={Groupes}
        options={{ accessibilityLabel: "Groups tab" }}
        listeners={{
          tabPress: e => {
            // Prevent default action
            if(!user) e.preventDefault();
          },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
