import React, {
    createContext,
    useState,
    useContext,
    useEffect,
  } from 'react';
  import firebase from '../Config';

  export async function sendLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }
  
    let location = await Location.getCurrentPositionAsync({});
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    const message = `https://www.google.com/maps?q=${latitude},${longitude}`;
    return message;
  }
  
  export const initiateConnectionMonitor = (identifier) => {
    const userConnectionRef = firebase
      .database()
      .ref(`/ProfilsTable/Profil${identifier}`);
    const offlineState = {
      connectionState: 'offline',
      lastSeen: new Date(),
    };
    const onlineState = {
      connectionState: 'online',
      lastSeen: new Date(),
    };
    firebase
      .database()
      .ref('.info/connected')
      .on('value', (snapshot) => {
        if (snapshot.val() === false) {
          return;
        }
        userConnectionRef.onDisconnect().update(offlineState);
        userConnectionRef.update(onlineState);
      });
  };

  
  export const modifyConnectionStatus = (
    identifier,
    connectionState
  ) => {
    firebase.database().ref(`/ProfilsTable/Profil${identifier}`).update({
      connectionState: connectionState,
      lastSeen: new Date(),
    });
  };
  const UserContext = createContext();
  
  const db = firebase.database();
  export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const setCurrentUser = (userInfo) => {
      setUser({ ...user, ...userInfo });
    };
  
  
    useEffect(() => {
      setCurrentUser(firebase.auth().currentUser);
  
      if (!!user?.uid) {
        const userRef = db.ref(`/ProfilsTable/Profil${user.uid}`);
        const connectedRef = db.ref('.info/connected');
        const handleConnectionChange = (connected) => {
          if (connected) {
            userRef.set({
              status: 'online',
              lastActive: new Date(),
            });
            userRef.onDisconnect().set({
              status: 'offline',
              lastActive: new Date(),
            });
          } else {
            userRef.set({
              status: 'online',
              lastActive: new Date(),
            });
          }
        };
  
        connectedRef.on('value', handleConnectionChange);
  
        return () => {
          connectedRef.off('value', handleConnectionChange);
          userRef.set({
            status: 'online',
            lastActive: new Date(),
          });
        };
      }
    }, []);
    const clearUser = () => {
      setUser(null);
    };
    const logOut = (navigation) => {
      modifyConnectionStatus(user?.uid, 'offline');
      firebase
        .auth()
        .signOut()
        .then(() => {
          clearUser();
          navigation.navigate('Auth');
        })
        .catch((error) => {
          console.error(error);
          ToastAndroid.show(
            'Logout failed. Please try again.',
            ToastAndroid.SHORT
          );
        });
    };
  
    return (
      <UserContext.Provider
        value={{
          user,
          setCurrentUser,
          clearUser,
          logOut,
        }}
      >
        {children}
      </UserContext.Provider>
    );
  };
  
  export const useUser = () => useContext(UserContext);
  