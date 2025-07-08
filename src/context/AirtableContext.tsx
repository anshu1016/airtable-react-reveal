import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AirtableRecord } from '../types/airtable';

interface AirtableState {
  records: AirtableRecord[];
  selectedRecord: AirtableRecord | null;
  loading: boolean;
  error: string | null;
}

type AirtableAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECORDS'; payload: AirtableRecord[] }
  | { type: 'SET_SELECTED_RECORD'; payload: AirtableRecord | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: AirtableState = {
  records: [],
  selectedRecord: null,
  loading: false,
  error: null,
};

const airtableReducer = (state: AirtableState, action: AirtableAction): AirtableState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECORDS':
      return { ...state, records: action.payload, loading: false, error: null };
    case 'SET_SELECTED_RECORD':
      return { ...state, selectedRecord: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const AirtableContext = createContext<{
  state: AirtableState;
  dispatch: React.Dispatch<AirtableAction>;
} | null>(null);

export const AirtableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(airtableReducer, initialState);

  return (
    <AirtableContext.Provider value={{ state, dispatch }}>
      {children}
    </AirtableContext.Provider>
  );
};

export const useAirtable = () => {
  const context = useContext(AirtableContext);
  if (!context) {
    throw new Error('useAirtable must be used within an AirtableProvider');
  }
  return context;
};