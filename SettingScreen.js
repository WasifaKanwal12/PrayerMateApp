import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Button, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { setCalculationMethod, setJuristicSetting } from './actions/settingsAction';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SettingsScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState(0);




  const dispatch = useDispatch();
  const { calculationMethod, juristicSetting } = useSelector((state) => state.settings);
 
  const methods = [
    { label: 'Shia Ithna-Ashari', value: 0 },
    { label: 'University of Islamic Sciences, Karachi', value: 1 },
    { label: 'Islamic Society of North America', value: 2 },
    { label: 'Muslim World League', value: 3 },
    { label: 'Umm Al-Qura University, Makkah', value: 4 },
    { label: 'Egyptian General Authority of Survey', value: 5 },
    { label: 'Institute of Geophysics, University of Tehran', value: 7 },
    { label: 'Gulf Region', value: 8 },
    { label: 'Kuwait', value: 9 },
    { label: 'Qatar', value: 10 },
    { label: 'Majlis Ugama Islam Singapura, Singapore', value: 11 },
    { label: 'Union Organization islamic de France', value: 12 },
    { label: 'Diyanet İşleri Başkanlığı, Turkey', value: 13 },
    { label: 'Spiritual Administration of Muslims of Russia', value: 14 },
    { label: 'Moonsighting Committee Worldwide', value: 15 },
    { label: 'Dubai (unofficial)', value: 16 }
  ];
  const schools = [
    { label: 'Shafi', value: 0 },
    { label: 'Hanafi', value: 1 }
  ];
 
  const saveSettings = async () => {
    if (selectedMethod === null || selectedSchool === null) {
      Alert.alert("Error", "Please select both Calculation Method and Juristic Setting");
      return;
    }

    dispatch(setCalculationMethod(selectedMethod));
    dispatch(setJuristicSetting(selectedSchool));

    // Save settings in AsyncStorage
    try {
      await AsyncStorage.setItem('calculationMethod', JSON.stringify(selectedMethod));
      await AsyncStorage.setItem('juristicSetting', JSON.stringify(selectedSchool));
      console.log("Settings saved", { selectedMethod, selectedSchool }); // Debug log
      

    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <ImageBackground
      source={require('./assets/masjid3.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Prayer Calculation</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Calculation Method</Text>
          <Dropdown
            style={styles.dropdown}
            data={methods}
            labelField="label"
            valueField="value"
            placeholder="Select Method"
            value={selectedMethod || calculationMethod}
            onChange={item => setSelectedMethod(item.value)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Juristic Setting</Text>
          <Dropdown
            style={styles.dropdown}
            data={schools}
            labelField="label"
            valueField="value"
            placeholder="Select School"
            value={selectedSchool || juristicSetting}
            onChange={item => setSelectedSchool(item.value)}
          />
        </View>
        <Button title="Save" onPress={saveSettings} />
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    width: '40%',
  },
  dropdown: {
    flex: 1, // Ensure the dropdown takes up remaining space
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width:100,
    height:70,
  },
});

export default SettingsScreen;
