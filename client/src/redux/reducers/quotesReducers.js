import {GET_NAME, GET_QUOTES} from "../actions/constants";

const initialState = {
  quotes: {},
  name: ''
};

export default function(state = initialState, action ) {
  switch(action.type) {
    case GET_NAME:
      return {
        ...state,
        name: action.payload
      }
    case GET_QUOTES:
      return {
        ...state,
        quotes: action.payload
      }
    default:
      return state;
  }
};
