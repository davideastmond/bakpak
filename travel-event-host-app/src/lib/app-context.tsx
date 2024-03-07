'use client';
import React, { createContext, useContext, useReducer } from 'react';
interface IAppContext {
  appStatus: 'loading' | 'idle';
}

interface IAppAction {
  type: IAction;
  payload?: any;
}

export enum IAction {
  SET_LOADING = 'SET_LOADING',
  SET_IDLE = 'SET_IDLE',
}

const initialState: IAppContext = {
  appStatus: 'idle',
};

const AppContext = createContext<any>(initialState);

function appReducer(state: IAppContext, action: IAppAction): IAppContext {
  switch (action.type) {
    case IAction.SET_LOADING:
      return { ...state, appStatus: 'loading' };
    case IAction.SET_IDLE:
      return { ...state, appStatus: 'idle' };
    default:
      return state;
  }
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ ...state, dispatch: dispatch }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Invalid use of context');
  }
  return context;
};
