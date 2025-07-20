# PrayerMateApp
A React Native mobile application providing accurate daily prayer times based on user location. Features extensive customization for calculation methods and juristic settings, ensuring precise and personalized schedules.
# Prayer Mate App

![App Screenshot](./assets/screenshot.png)

## Introduction
Prayer Mate is a mobile application built with React Native that helps Muslims track prayer times based on their current location. The app provides accurate prayer times using the Aladhan API and allows users to customize calculation methods according to different Islamic schools of thought.

## Features
- Real-time prayer times based on device location
- Customizable calculation methods (15+ Islamic organizations)
- Juristic setting selection (Shafi/Hanafi)
- Highlighted upcoming prayer
- Beautiful UI with mosque background
- Offline storage of settings and location

## Technologies Used
- React Native
- Redux (State Management)
- React Navigation (Drawer & Stack Navigation)
- Expo Location Services
- Aladhan Prayer Times API
- AsyncStorage (Local Storage)
- React Native Elements (Dropdown)

## Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the app: `expo start`

## App Flow
1. **Splash Screen**: 
   - Requests location permission
   - Fetches and stores user location
   - Displays animated hadith about prayer

2. **Home Screen**:
   - Shows current location coordinates
   - Displays all 5 daily prayer times
   - Highlights the next upcoming prayer
   - Uses beautiful mosque background

3. **Settings Screen**:
   - Allows selection of calculation method
   - Provides juristic setting options
   - Saves preferences to local storage

## API Used
The app uses the [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api) to fetch accurate prayer times based on:
- Latitude/Longitude
- Calculation Method
- Juristic Setting
- Timezone

## Future Enhancements
- Push notifications for prayer times
- Qibla direction finder
- Islamic calendar integration
- Multiple location support