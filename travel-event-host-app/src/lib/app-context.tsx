'use client';
import React, { Dispatch, createContext, useContext, useReducer } from 'react';
interface IAppContext {
  appStatus: 'loading' | 'idle';
  appDispatch: Dispatch<IAppAction> | null;
}

interface IAppAction {
  type: IAppActionType;
  payload?: any;
}

export enum IAppActionType {
  SET_LOADING = 'SET_LOADING',
  SET_IDLE = 'SET_IDLE',
}

const initialState: IAppContext = {
  appStatus: 'idle',
  appDispatch: null,
};

const AppContext = createContext<IAppContext>(initialState);

function appReducer(state: IAppContext, action: IAppAction): IAppContext {
  switch (action.type) {
    case IAppActionType.SET_LOADING:
      return { ...state, appStatus: 'loading' };
    case IAppActionType.SET_IDLE:
      return { ...state, appStatus: 'idle' };
    default:
      return state;
  }
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ ...state, appDispatch: dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Invalid use of context');
  }
  return context;
};
