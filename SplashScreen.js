import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Easing, Modal, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocation } from './actions/prayerActions';
import { useDispatch } from 'react-redux';

const SplashScreen = ({ navigation }) => {
  const moveAnim = useRef(new Animated.Value(-500)).current; // Initial position off the screen
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

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

    const fetchLocation = async () => {
      try {
        const storedLocation = await AsyncStorage.getItem('userLocation');
        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);
          dispatch(setLocation(parsedLocation));
          setShowPopup(true);
          setTimeout(() => {
            setShowPopup(false);
            navigation.navigate('Main', { screen: 'Home', params: { latitude: parsedLocation.latitude, longitude: parsedLocation.longitude } });
          }, 2000); // Wait for 1 second before navigating
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
          }
          const options = {
            accuracy: Location.Accuracy.High,
          };
          const currentLocation = await Location.getCurrentPositionAsync(options);
          const { latitude, longitude } = currentLocation.coords;
          await AsyncStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
          dispatch(setLocation({ latitude, longitude }));
          setShowPopup(true);
          setTimeout(() => {
            setShowPopup(false);
            navigation.navigate('Main', { screen: 'Home', params: { latitude, longitude } });
          }, 2000); // Wait for 1 second before navigating
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

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
