import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocation, setPrayerTimes, setUpcomingPrayer } from './actions/prayerActions';


const HomeScreen = ({navigation,route}) => {
   const{latitude,longitude}=route.params;
   console.log("latilong",latitude,longitude);
  const dispatch = useDispatch();
  const { location, prayerTimes, upcomingPrayer } = useSelector((state) => state.prayer);
  const { calculationMethod, juristicSetting } = useSelector((state) => state.settings);
  useEffect(() => {
    const fetchLocation = async () => {
      
          fetchPrayerSettings(latitude,longitude);
       
          
        
    };
    fetchLocation();
  }, []);

  
  useEffect(() => {
    if (location) {
      console.log("fetch calling");
      fetchPrayerSettings(location.latitude, location.longitude);
      console.log("fetch caled");
    }
  }, [calculationMethod, juristicSetting]);

  const fetchPrayerSettings = async (latitude, longitude) => {
 latitude=29.321062;
 longitude=68.581141;
    
    try {
      const storedMethod = await AsyncStorage.getItem('calculationMethod');
      const storedSchool = await AsyncStorage.getItem('juristicSetting');
      
      const method = storedMethod ? JSON.parse(storedMethod) : calculationMethod;
      const school = storedSchool ? JSON.parse(storedSchool) : juristicSetting;

      fetchPrayerTimes(latitude, longitude, method, school);
    } catch (error) {
      console.error('Error fetching prayer settings:', error);
    }
  };
  const fetchPrayerTimes = async (latitude, longitude, method, school) => {
    
    try {
       
      if (!latitude || !longitude) {
        return;
      }
      
        //const url1 =   'http://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&timezonestring=GMT+5';
       
        const today = new Date();
        const date = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
        console.log(date,latitude,longitude);
        console.log(method,school);


        const response = await fetch(`http://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&timezonestring=GMT+5`);
        
        const data = await response.json();
        console.log(data);
        const { timings } = data.data;
        delete timings.Imsak;
        delete timings.Midnight;
        delete timings.Firstthird;
        delete timings.Lastthird;
        dispatch(setPrayerTimes(timings));
        console.log(timings);
        const currentTime = today.getHours() * 60 + today.getMinutes();
        const prayerTimesArray = Object.entries(timings).map(([name, time]) => {
          if (typeof time === 'string' && time.includes(':')) {
            return {
              name,
              time: parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]),
            };
          } else {
            console.error(`Time for ${name} is not a string or does not contain a colon:`, time);
            return null;
          }
        }).filter(item => item !== null);

        const nextPrayer = prayerTimesArray.find(prayer => prayer.time > currentTime);
        console.log("next",nextPrayer);
        dispatch(setUpcomingPrayer(nextPrayer));
      }
     catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  };
  
 
 console.log("loc",location,upcomingPrayer,prayerTimes);
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ImageBackground
        source={require('./assets/masjid3.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Latitude: </Text>
              <Text style={styles.locationValue}>{location?.latitude}</Text>
              <Text style={styles.locationLabel}>Longitude: </Text>
              <Text style={styles.locationValue}>{location?.longitude}</Text>

            </View>
          </View>
          {prayerTimes && (
            <View style={styles.prayerTimesContainer}>
              <Text style={styles.methodLabel}>Daily Prayer Timings</Text>
              {Object.entries(prayerTimes).map(([name, time]) => (
                <View
                  key={name}
                  style={[
                    styles.prayerTimeRow, 
                    upcomingPrayer && name === upcomingPrayer.name && styles.upcomingPrayerContainer,
                  ]}
                >
                  {upcomingPrayer && name === upcomingPrayer.name ? (
                    <ImageBackground
                      source={require('./assets/masjid2.jpg')}
                      style={styles.upcomingPrayerImage}
                    >
                      <View style={styles.upcomingPrayerContent}>
                        <Text style={styles.prayerTimeLabel}>{name}: </Text>
                        <Text style={styles.prayerTimeValue}>{time}</Text>
                      </View>
                    </ImageBackground>
                  ) : (
                    <View style={styles.prayerInfoContainer}>
                      <Text style={styles.prayerTimeLabel}>{name}: </Text>
                      <Text style={styles.prayerTimeValue}>{time}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  locationContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
  },
  locationLabel: {
    fontSize: 16,
    color: 'white',
    marginLeft: 5,
  },
  locationValue: {
    fontSize: 16,
    color: 'white',
  },
  prayerTimesContainer: {
    width: '100%',
    backgroundColor: '#ffefd5',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingPrayerImage: {
    padding: 0,
    width: '100%',
    height: 125,
    flexDirection: 'row',
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
  },
  upcomingPrayerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  methodLabel: {
    fontSize: 19,
    color: 'black',
    marginBottom: 10,
    fontWeight:'bold',
   

  },
  

  prayerTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(211, 211, 211, 0.5)',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
  },
  upcomingPrayerContainer: {
    height: 125,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  prayerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  prayerTimeLabel: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  prayerTimeValue: {
    fontSize: 16,
    color: 'black',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
});

export default HomeScreen;
