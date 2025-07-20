import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Easing, Modal, TouchableOpacity, Alert } from 'react-native'; // Added Alert
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocation } from './actions/prayerActions';
import { useDispatch } from 'react-redux';

const SplashScreen = ({ navigation }) => {
  const moveAnim = useRef(new Animated.Value(-500)).current; // Initial position off the screen
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

  // --- TEMPORARY: Effect to clear AsyncStorage for debugging ---
  // REMOVE THIS useEffect BLOCK AFTER YOU CONFIRM THE LOCATION IS FETCHED CORRECTLY
  useEffect(() => {
    const clearStorage = async () => {
      try {
        await AsyncStorage.removeItem('userLocation');
        console.log("SplashScreen: Cleared 'userLocation' from AsyncStorage.");
      } catch (e) {
        console.error("SplashScreen: Failed to clear AsyncStorage:", e);
      }
    };
    clearStorage();
  }, []); // Runs once on mount
  // --- END TEMPORARY BLOCK ---


  useEffect(() => {
    const animateText = () => {
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 500,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: -500,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => animateText());
    };

    animateText();

    const fetchAndNavigate = async () => {
      try {
        let latitude;
        let longitude;

        // --- DEBUGGING STEP 1: Check what's in AsyncStorage ---
        const storedLocation = await AsyncStorage.getItem('userLocation');
        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);
          latitude = parsedLocation.latitude;
          longitude = parsedLocation.longitude;
          console.log("SplashScreen: Using stored location:", latitude, longitude); // <-- CHECK THIS LOG
        } else {
          // Request permissions
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.warn('SplashScreen: Permission to access location was denied. Using default coordinates.');
            // Fallback to default coordinates if permission denied
            // Using precise coordinates for Fateh Jang, Pakistan
            latitude = 33.5506; // More precise latitude
            longitude = 72.6406; // More precise longitude
            Alert.alert(
              "Location Permission Denied",
              "Please grant location permission to get accurate prayer times. Using default location for now."
            );
          } else {
            const options = {
              accuracy: Location.Accuracy.High, // Request high accuracy
            };
            const currentLocation = await Location.getCurrentPositionAsync(options);
            latitude = currentLocation.coords.latitude;
            longitude = currentLocation.coords.longitude;
            console.log("SplashScreen: Fetched current location from Expo:", latitude, longitude); // <-- CHECK THIS LOG
            
            // --- DEBUGGING STEP 2: Check what's being stored ---
            await AsyncStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
            console.log("SplashScreen: Stored new location in AsyncStorage."); // <-- CONFIRM STORAGE
          }
        }

        // Dispatch the location to Redux
        dispatch(setLocation({ latitude, longitude }));

        // Show popup and navigate
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          // --- DEBUGGING STEP 3: Check what's being passed to navigation ---
          console.log("SplashScreen: Navigating with Lat:", latitude, "Long:", longitude); // <-- CHECK THIS LOG
          navigation.navigate('Main', { screen: 'Home', params: { latitude, longitude } });
        }, 2000); // Wait for 2 seconds before navigating

      } catch (error) {
        console.error('SplashScreen: Error fetching location or navigating:', error);
        Alert.alert("Error", `Failed to get location: ${error.message}. Please try again.`);
        // Fallback to default coordinates in case of any error during location fetching
        navigation.navigate('Main', { screen: 'Home', params: { latitude: 33.5506, longitude: 72.6406 } });
      }
    };

    // This useEffect should run after the temporary clearStorage useEffect
    // to ensure location is always re-fetched or precise defaults are used.
    // It's crucial that this fetchAndNavigate is called.
    const navigationTimeout = setTimeout(() => {
        fetchAndNavigate();
    }, 100); // Small delay to ensure AsyncStorage clear has a chance to complete
    
    return () => clearTimeout(navigationTimeout); // Cleanup timeout

  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/masjid3.jpg')}
        resizeMode="cover"
        style={styles.image}
      >
        <Text style={styles.title}>Prayer Mate</Text>
        <Animated.Text style={[styles.text, { transform: [{ translateX: moveAnim }] }]}>
          "The first matter that the slave will be brought to account for on the Day of Judgment is the prayer..."
        </Animated.Text>
        <Modal
          visible={showPopup}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPopup(false)}
        >
          <View style={styles.popupContainer}>
            <Text style={styles.popupText}>Location fetched, navigating to home screen...</Text>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    position: 'absolute',
    top: 50, // Adjust position as needed
  },
  text: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    backgroundColor: '#000000c0',
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 50, // Adjust position as needed
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

export default SplashScreen;
