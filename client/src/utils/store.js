import { createStore } from 'redux';

const REDUCERMAP = {};
const SUBSCRIBERMAP = {};

export function register(type, func) {
  if (REDUCERMAP[type]) {
    console.warn(`Reducer \`${type}\` is replaced.`)
  }
  REDUCERMAP[type] = func;
}

export function cancel(type, func) {
  delete REDUCERMAP[type];
}

function rootReducer(state = {}, action) {
  const { type, ...data } = action;

  const ret = { ...state };
  let func = REDUCERMAP[type];
  if (func) {
    const subState = Object.assign(state[type] || {});
    // for (const func of list) {
    //   Object.assign(subState, func(subState, action))
    // }
    ret[type] = func(subState, action);
  }
  return ret;
}

let lastState = {};

function rootSubscriber() {
  const state = store.getState();
  for (const type of Object.keys(SUBSCRIBERMAP)) {
    const subState = state[type] || {};
    const list = SUBSCRIBERMAP[type];
    for (const func of list) {
      func(subState, state, type);
    }
  }
}

const store = createStore(rootReducer);

store.subscribe(rootSubscriber);

export function dispatch(type, data) {
  if (data['type']) {
    console.log('data shouldn\'t have `type` type.');
  }
  store.dispatch({
    ...data,
    type: type
  });
}

export function subscribe(type, func) {
  let list = SUBSCRIBERMAP[type];
  if (!list) {
    list = [];
    SUBSCRIBERMAP[type] = list;
  }
  if (!list.includes(func)) {
    list.push(func);
  }
}

export function unsubscribe(type, func) {
  let list = SUBSCRIBERMAP[type];
  if (list) {
    const index = list.indexOf(func);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }
}
