import axios from 'axios';
import {GET_NAME, GET_QUOTES} from "./constants";


//экшнкреатор для получения имени (почта)
export const getUserName = (token) => async dispatch => {

  await axios.get('/me', {headers: {Authorization: token}})
    .then(user => {
      dispatch(getUserNameAction(user.data.email))
    })
    .catch(err => console.log(err));
};

export const getUserNameAction = name => {
  return {
    type: GET_NAME,
    payload: name
  }
};

//для постов
export const getUserQuotes = (token) => async dispatch => {

  await axios.get('/quotes', {headers: {Authorization: token}})
    .then(res => {
      dispatch(getUserQuotesAction(res.data))
    })
    .catch(err => console.log(err));
};

export const getUserQuotesAction = quote => {
  return {
    type: GET_QUOTES,
    payload: quote
  }
};

//для нового поста
export const getNewPost = (quote, token) => async dispatch => {

  await axios.post('/quotes', quote, {headers: {Authorization: token}})
    .then(res => {

    })
    .catch(err => console.log(err));
};
