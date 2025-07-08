import { useCallback } from 'react';
import { airtableAPI } from '../utils/airtableAPI';
import { useAirtable } from '../context/AirtableContext';

export const useAirtableAPI = () => {
  const { dispatch } = useAirtable();

  const fetchRecords = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const records = await airtableAPI.getAllRecords();
      dispatch({ type: 'SET_RECORDS', payload: records });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  }, [dispatch]);

  const fetchRecord = useCallback(async (recordId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const record = await airtableAPI.getRecord(recordId);
      dispatch({ type: 'SET_SELECTED_RECORD', payload: record });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  }, [dispatch]);

  return {
    fetchRecords,
    fetchRecord,
  };
};