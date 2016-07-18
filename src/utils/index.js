import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// Broken ?
export function createConstants(...constants) {
  let a = constants.reduce((acc, constant) => {
    acc[constant] = constant;
    return acc;
  }, {});

  return a;
}

export function createReducer(initialState, reducerMap) {
  return (state = initialState, action) => {
    const reducer = reducerMap[action.type];

    return reducer
      ? reducer(state, action.payload)
      : state;
  };
}

export function checkHttpStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}