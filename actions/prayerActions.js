// Import action types
import { SET_LOCATION, SET_PRAYER_TIMES, SET_UPCOMING_PRAYER } from './actionTypes';

// Action creators
export const setLocation = (location) => ({
  type: SET_LOCATION,
  payload: location,
});

export const setPrayerTimes = (prayerTimes) => ({
  type: SET_PRAYER_TIMES,
  payload: prayerTimes,
});

export const setUpcomingPrayer = (upcomingPrayer) => ({
  type: SET_UPCOMING_PRAYER,
  payload: upcomingPrayer,
});
