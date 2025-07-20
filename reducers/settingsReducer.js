import { SET_CALCULATION_METHOD, SET_JURISTIC_SETTING } from '../actions/settingsActionsTypes';

const initialState = {
  calculationMethod: null,
  juristicSetting: null,
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CALCULATION_METHOD:
      return { ...state, calculationMethod: action.payload };
    case SET_JURISTIC_SETTING:
      return { ...state, juristicSetting: action.payload };
    default:
      return state;
  }
};

export default settingsReducer;
