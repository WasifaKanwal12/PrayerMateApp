import { combineReducers, configureStore } from '@reduxjs/toolkit';
import prayerReducer from '../reducers/prayerReducer';
import settingsReducer from '../reducers/settingsReducer';

const rootReducer = combineReducers({
  prayer: prayerReducer,
  settings: settingsReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
