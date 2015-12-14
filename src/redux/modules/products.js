const LOAD = 'redux-example/products/LOAD';
const LOAD_SUCCESS = 'redux-example/products/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/products/LOAD_FAIL';
const EDIT_START = 'redux-example/products/EDIT_START';
const EDIT_STOP = 'redux-example/products/EDIT_STOP';
const SAVE = 'redux-example/products/SAVE';
const SAVE_SUCCESS = 'redux-example/products/SAVE_SUCCESS';
const SAVE_FAIL = 'redux-example/products/SAVE_FAIL';
const FLIP = 'redux-example/products/FLIP';
const FLIP_SUCCESS = 'redux-example/products/FLIP_SUCCESS';
const FLIP_FAIL = 'redux-example/products/FLIP_FAIL';

const initialState = {
  loaded: false,
  editing: {},
  saveError: {},
  activePage: 1
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result.products,
        count: action.result.count,
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
    case EDIT_START:
      return {
        ...state,
        editing: {
          ...state.editing,
          [action.id]: true
        }
      };
    case EDIT_STOP:
      return {
        ...state,
        editing: {
          ...state.editing,
          [action.id]: false
        }
      };
    case SAVE:
      return state; // 'saving' flag handled by redux-form
    case SAVE_SUCCESS:
      const data = [...state.data];
      data[action.result.id - 1] = action.result;
      return {
        ...state,
        data: data,
        editing: {
          ...state.editing,
          [action.id]: false
        },
        saveError: {
          ...state.saveError,
          [action.id]: null
        }
      };
    case SAVE_FAIL:
      return typeof action.error === 'string' ? {
        ...state,
        saveError: {
          ...state.saveError,
          [action.id]: action.error
        }
      } : state;
    case FLIP:
      return {
        ...state,
        loading: true
      };
    case FLIP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.result.products,
        activePage: action.result.page
      };
    case FLIP_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.products && globalState.products.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/product/load') // params not used, just shown as demonstration
  };
}

export function save(product) {
  return {
    types: [SAVE, SAVE_SUCCESS, SAVE_FAIL],
    id: product.id,
    promise: (client) => client.post('/product/update', {
      data: product
    })
  };
}

export function editStart(id) {
  return { type: EDIT_START, id };
}

export function editStop(id) {
  return { type: EDIT_STOP, id };
}

export function changePage(page) {
  console.log('redux for changePage');

  return {
    types: [FLIP, FLIP_SUCCESS, FLIP_FAIL],
    promise: (client) => client.get('/product/load?page=' + page) // params not used, just shown as demonstration
  };
}
