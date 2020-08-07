import axios from 'axios';
import {SET_CURRENT_USER} from "./constants";
import setAuthToken from "../setAuthToken";

export const registerUser = (user) => dispatch => {
  axios.post('/register', user)
    .then(res =>
      console.log('Registered!')
    )
};

export const loginUser = (user) => async dispatch => {

 await axios
    .post('/login', user)
    .then(response => {

      localStorage.setItem('usertoken', JSON.stringify(response.data));

      dispatch(setCurrentUser(JSON.stringify(response.data)))
    })

};

export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
};

export const logoutUser = (history) => dispatch => {
  localStorage.removeItem('usertoken');
  setAuthToken(false);
  dispatch(setCurrentUser({}));
  history.push('/');
};