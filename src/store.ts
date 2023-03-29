import {Action, applyMiddleware, createStore, Dispatch, logger, reactRedux} from "./redux";

const initialState = {
    count: 0,
}

const initialUserState = {
    users: [],
};

const userReducer = (state = initialUserState, action: Action) => {
    switch (action.type) {
        case 'SUCCESS':
            return {
                ...state,
                users: action.payload,
            };

        default:
            return {
                ...state,
            };
    }
};

const countReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case 'INCREMENT':
            return {
                ...state,
                count: state.count + action.payload
            };
        case 'DECREMENT':
            return {
                ...state,
                count: state.count - action.payload
            };
        default:
            return {
                ...state
            }
    }
}

const someAction = () => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: 'STARTED' });

        await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

        dispatch({ type: 'SUCCESS' });
    }
}

// const rootReducer = combineReducers({ userState: userReducer, countState: countReducer });
const createStoreWithMiddleware = applyMiddleware(logger)(createStore);
const storeWithMiddle = createStoreWithMiddleware(countReducer);
// storeWithMiddle.dispatch({ type: '__INIT__' });
export const { Provider, useDispatch, useStore } = reactRedux(storeWithMiddle);