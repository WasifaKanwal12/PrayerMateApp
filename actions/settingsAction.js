import { SET_CALCULATION_METHOD, SET_JURISTIC_SETTING } from './settingsActionsTypes';

export const setCalculationMethod = (method) => ({
  type: SET_CALCULATION_METHOD,
  payload: method,
});

export const setJuristicSetting = (setting) => ({
  type: SET_JURISTIC_SETTING,
  payload: setting,
});
