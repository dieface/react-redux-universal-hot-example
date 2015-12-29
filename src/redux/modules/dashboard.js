const LOAD = 'redux-example/dashboard/LOAD';
const LOAD_SUCCESS = 'redux-example/dashboard/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/dashboard/LOAD_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      const fetched = action.result;
      return {
        ...state,
        loading: false,
        loaded: true,
        data: fetched,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.dashboard && globalState.dashboard.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/loadGender') // params not used, just shown as demonstration
  };
}
