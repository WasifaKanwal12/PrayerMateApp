// Import action types
import { SET_LOCATION, SET_PRAYER_TIMES, SET_UPCOMING_PRAYER } from '../actions/actionTypes';

// Initial state
const initialState = {
  location: null,
  prayerTimes: null,
  upcomingPrayer: null,
};

// Reducer function
const prayerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCATION:
      return { ...state, location: action.payload };
    case SET_PRAYER_TIMES:
      return { ...state, prayerTimes: action.payload };
    case SET_UPCOMING_PRAYER:
      return { ...state, upcomingPrayer: action.payload };
    default:
      return state;
  }
};

export default prayerReducer;
