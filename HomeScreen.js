import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocation, setPrayerTimes, setUpcomingPrayer } from './actions/prayerActions';


const HomeScreen = ({ navigation, route }) => {
    // Renamed route.params to initialLatitude/Longitude to avoid confusion
    const { latitude: initialLatitude, longitude: initialLongitude } = route.params;

    // State to manage the latitude and longitude actively used for API calls
    const [currentLatitude, setCurrentLatitude] = useState(null);
    const [currentLongitude, setCurrentLongitude] = useState(null);

    const dispatch = useDispatch();
    const { location, prayerTimes, upcomingPrayer } = useSelector((state) => state.prayer);
    const { calculationMethod, juristicSetting } = useSelector((state) => state.settings);

    // Removed hardcoded latitude and longitude values.
    // The component will now rely solely on the latitude and longitude passed via route.params.

    // Effect to set initial latitude/longitude from route params
    useEffect(() => {
        if (initialLatitude && initialLongitude) {
            console.log("Using lat/long from route.params:", initialLatitude, initialLongitude);
            setCurrentLatitude(initialLatitude);
            setCurrentLongitude(initialLongitude);
            // Dispatch location to Redux state for display and other uses
            dispatch(setLocation({ latitude: initialLatitude, longitude: initialLongitude }));
        } else {
            console.warn("Initial latitude or longitude is missing from route params.");
            // Optionally, handle the case where initial location is not provided,
            // e.g., by displaying a message or navigating to a location selection screen.
        }
    }, [initialLatitude, initialLongitude, dispatch]); // Dependencies ensure this runs when params change

    // Effect to fetch prayer times when current coordinates, method, or school change
    useEffect(() => {
        if (currentLatitude && currentLongitude) {
            console.log("fetch calling with coordinates:", currentLatitude, currentLongitude);
            fetchPrayerSettings(currentLatitude, currentLongitude);
            console.log("fetch called");
        }
    }, [currentLatitude, currentLongitude, calculationMethod, juristicSetting]); // Dependencies for re-fetching

    // Function to fetch prayer settings (method/school) from AsyncStorage
    // and then call fetchPrayerTimes with the correct coordinates and settings
    const fetchPrayerSettings = async (lat, long) => { // Use distinct parameter names (lat, long)
        console.log("Fetching settings for:", lat, long); // Log the actual coordinates being used

        try {
            const storedMethod = await AsyncStorage.getItem('calculationMethod');
            const storedSchool = await AsyncStorage.getItem('juristicSetting');

            // Use stored values or fall back to Redux state
            // Changed JSON.parse to parseInt for method and school
            const method = storedMethod ? parseInt(storedMethod, 10) : calculationMethod;
            const school = storedSchool ? parseInt(storedSchool, 10) : juristicSetting;

            await fetchPrayerTimes(lat, long, method, school); // Pass lat, long directly
        } catch (error) {
            console.error('Error in fetchPrayerSettings:', error);
            Alert.alert("Error", "Could not fetch prayer settings. Please try again.");
        }
    };

    // Function to fetch prayer times from the API
    const fetchPrayerTimes = async (latitude, longitude, method, school) => {
        try {
            if (!latitude || !longitude) {
                console.warn("Latitude or Longitude is missing, cannot fetch prayer times.");
                Alert.alert("Error", "Location data is missing. Please ensure location is provided.");
                return;
            }

            const today = new Date();
            const date = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
            
            console.log(`API Request Date: ${date}, Lat: ${latitude}, Long: ${longitude}`);
            console.log(`API Request Method, School: ${method}, ${school}`);

            // Removed timezonestring from the API URL
            const response = await fetch(
                `http://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`
            );

            // --- IMPORTANT: Check if the HTTP response was successful ---
            if (!response.ok) {
                const errorData = await response.json(); // Attempt to parse error message from API
                console.error('Aladhan API Error:', response.status, errorData);
                // Display user-friendly error from API if available
                const errorMessage = errorData.data || 'Failed to fetch prayer times due to an API error.';
                Alert.alert("API Error", `Error ${response.status}: ${errorMessage}`);
                throw new Error(`Failed to fetch prayer times: ${response.statusText}`);
            }
            // --- End Important Check ---

            const data = await response.json();
            console.log("API Response Data:", data);

            // Check if data.data is available and has timings
            if (!data || !data.data || !data.data.timings) {
                console.error("API response structure is not as expected:", data);
                Alert.alert("Error", "Received unexpected data from prayer times API.");
                return;
            }

            const { timings } = data.data;

            // Delete unwanted properties
            delete timings.Imsak;
            delete timings.Midnight;
            delete timings.Firstthird;
            delete timings.Lastthird;
            dispatch(setPrayerTimes(timings));
            console.log("Processed Timings:", timings);

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

            // Find the next prayer
            const nextPrayer = prayerTimesArray.find(prayer => prayer.time > currentTime);
            console.log("Next Prayer:", nextPrayer);
            dispatch(setUpcomingPrayer(nextPrayer));

        } catch (error) {
            console.error('Error fetching or processing prayer times:', error);
            // Catch network errors or errors thrown by the `response.ok` check
            Alert.alert("Network Error", `Could not connect to prayer times server. ${error.message}`);
        }
    };

    console.log("Current Redux State - Location:", location, "Upcoming Prayer:", upcomingPrayer, "Prayer Times:", prayerTimes);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <ImageBackground
                source={require('./assets/masjid3.jpg')}
                style={styles.backgroundImage}
            >
                <View style={styles.container}>
                    {/* Location Display */}
                    <View style={styles.locationContainer}>
                        <View style={styles.locationRow}>
                            <Text style={styles.locationLabel}>Latitude: </Text>
                            <Text style={styles.locationValue}>{location?.latitude}</Text>
                            <Text style={styles.locationLabel}>Longitude: </Text>
                            <Text style={styles.locationValue}>{location?.longitude}</Text>
                        </View>
                    </View>

                    {/* Prayer Times Display */}
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
        fontWeight: 'bold',
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
