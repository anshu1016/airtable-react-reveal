import axios from 'axios';
import { AirtableResponse, AirtableRecord } from '../types/airtable';
import { demoRecords } from './demoData';

// These would typically come from environment variables
// For demo purposes, we'll use placeholder values
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || '<BASE_ID_OF_THE_AIRTABLE_TABLE>';
const AIRTABLE_API_TOKEN = import.meta.env.VITE_AIRTABLE_API_TOKEN || 'your_api_token_here';
const TABLE_NAME = import.meta.env.VITE_TABLE_NAME || 'Imported Table';

// Check if we have valid credentials (not placeholder values)
const hasValidCredentials = AIRTABLE_BASE_ID !== '<BASE_ID_OF_THE_AIRTABLE_TABLE>' && 
                           AIRTABLE_API_TOKEN !== 'your_api_token_here' &&
                           AIRTABLE_BASE_ID && 
                           AIRTABLE_API_TOKEN;

const baseURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const airtableClient = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const airtableAPI = {
  async getAllRecords(): Promise<AirtableRecord[]> {
    // Use demo data if no valid credentials are provided
    if (!hasValidCredentials) {
      console.log('Using demo data - configure VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_TOKEN to use real Airtable data');
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return demoRecords;
    }

    try {
      const response = await airtableClient.get<AirtableResponse>(`/${TABLE_NAME}`);
      return response.data.records;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw new Error('Failed to fetch records from Airtable');
    }
  },

  async getRecord(recordId: string): Promise<AirtableRecord> {
    // Use demo data if no valid credentials are provided
    if (!hasValidCredentials) {
      console.log('Using demo data - configure VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_TOKEN to use real Airtable data');
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      const record = demoRecords.find(r => r.id === recordId);
      if (!record) {
        throw new Error('Record not found');
      }
      return record;
    }

    try {
      const response = await airtableClient.get<AirtableRecord>(`/${TABLE_NAME}/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching record:', error);
      throw new Error('Failed to fetch record from Airtable');
    }
  },
};