import {Context, createContext, ReactNode, useContext} from "react";

type AsyncAction = (dispatch: (action: Action) => void, state: newState) => Promise<any>;

type Action<T = any> = {
    type: string;
    payload?: T;
};

type newState<T extends {} = {}> = T;
type Reducer<G extends Record<string, any>> = (state: G | undefined, type: Action) => newState
const createStore = <T extends Record<string, any>>(reducer: Reducer<T>) => {
    let state = reducer(undefined, { type: '__INIT__' });
    let subscribers: (() => void)[] = [];

    return {
        getState: () => state,
        dispatch: (action: Action) => {
            state = reducer(state as T, action);
            subscribers.forEach((cb) => cb());
        },
        subscribe: (cb: () => void) => subscribers.push(cb),
    }
}

type StoreType = ReturnType<typeof createStore>;
type CreateStoreType = typeof createStore;

const combineReducers = (reducersMap: Record<string, Reducer<any>>) => {

    return (state: newState<any>, action: Action) => {
        const nextState: newState<any> = {};

        Object.entries(reducersMap).forEach(([key, reducer]) => {
            nextState[key] = reducer(state[key], action)
        })

        return nextState;
    }
}

const logger = (store: StoreType) => (dispatch: (action: Action) => void) => (action: Action) => {
    console.log(action.type, action.payload);
    return dispatch(action);
}

type Dispatch = (action: Action | AsyncAction) => void;

const thunk = (store: StoreType) => (dispatch: (action: Action | AsyncAction) => void) => (action: Action) => {
    if (typeof action === 'function') {
        return (action as AsyncAction)(store.dispatch, store.getState);
    }

    return dispatch(action as Action);
};

const applyMiddleware = (middleware: (...args: any[]) => any) => {
    return (createStore: CreateStoreType) => {
        return (reducer: Reducer<any>) => {
            const store = createStore(reducer);
            return {
                dispatch: (action: Action) => middleware(store)(store.dispatch)(action),
                getState: store.getState,
            }
        }
    }
};

function reactRedux(store: StoreType & any) {
    const Context = createContext<StoreType>(store);

    const useStore = () => {
        const store = useContext(Context);
        if (!store) {
            throw new Error("Can not use `useStore` outside of the `Provider`");
        }
        return store;
    };

    const Provider = ({children}: {children: ReactNode}) => {

        return (
            <Context.Provider value={store}>{children}</Context.Provider>
        )
    }

    const useDispatch = () => {
        const store = useStore();

        return (action: Action) => {
            store.dispatch(action);
        }
    }

    return { Provider, useStore, useDispatch }
}

export { createStore, combineReducers, applyMiddleware, thunk, logger, reactRedux };
export type { Action, Dispatch };