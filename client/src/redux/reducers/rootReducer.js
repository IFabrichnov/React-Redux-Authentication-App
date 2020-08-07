import { combineReducers } from 'redux';
import errorReducer from './errorsReducer';
import authReducer from './authReducers';
import quotesReducers from "./quotesReducers";

export const rootReducer = combineReducers({
  errors: errorReducer,
  auth: authReducer,
  quotes: quotesReducers
});