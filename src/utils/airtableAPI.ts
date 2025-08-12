import axios from 'axios';
import { AirtableResponse, AirtableRecord } from '../types/airtable';
import { demoRecords } from './demoData';

// These would typically come from environment variables
// For demo purposes, we'll use placeholder values
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || '';
const AIRTABLE_API_TOKEN = import.meta.env.VITE_AIRTABLE_API_TOKEN || '';
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
    console.log('🔍 Fetching all records...');
    console.log('🔧 API Config:', {
      baseId: AIRTABLE_BASE_ID ? `${AIRTABLE_BASE_ID.substring(0, 8)}...` : 'Not set',
      token: AIRTABLE_API_TOKEN ? `${AIRTABLE_API_TOKEN.substring(0, 8)}...` : 'Not set',
      tableName: TABLE_NAME,
      hasValidCredentials
    });

    // Use demo data if no valid credentials are provided
    if (!hasValidCredentials) {
      console.log('⚠️  Using demo data - configure VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_TOKEN to use real Airtable data');
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('📊 Demo data loaded:', demoRecords.length, 'records');
      return demoRecords;
    }

    try {
      console.log('🌐 Making API request to:', `${baseURL}/${TABLE_NAME}`);
      const response = await airtableClient.get<AirtableResponse>(`/${TABLE_NAME}`);
      console.log('✅ API Response received:', {
        status: response.status,
        recordCount: response.data.records?.length || 0,
        hasRecords: !!response.data.records
      });
      console.log('📝 First record sample:', response.data.records?.[0]);
      return response.data.records;
    } catch (error) {
      console.error('❌ Error fetching records:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
      }
      throw new Error('Failed to fetch records from Airtable');
    }
  },

  async getRecord(recordId: string): Promise<AirtableRecord> {
    console.log('🔍 Fetching single record:', recordId);
    console.log('🔧 API Config:', {
      baseId: AIRTABLE_BASE_ID ? `${AIRTABLE_BASE_ID.substring(0, 8)}...` : 'Not set',
      token: AIRTABLE_API_TOKEN ? `${AIRTABLE_API_TOKEN.substring(0, 8)}...` : 'Not set',
      tableName: TABLE_NAME,
      hasValidCredentials
    });

    // Use demo data if no valid credentials are provided
    if (!hasValidCredentials) {
      console.log('⚠️  Using demo data - configure VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_TOKEN to use real Airtable data');
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      const record = demoRecords.find(r => r.id === recordId);
      if (!record) {
        console.log('❌ Record not found in demo data:', recordId);
        throw new Error('Record not found');
      }
      console.log('✅ Demo record found:', record);
      return record;
    }

    try {
      console.log('🌐 Making API request to:', `${baseURL}/${TABLE_NAME}/${recordId}`);
      const response = await airtableClient.get<AirtableRecord>(`/${TABLE_NAME}/${recordId}`);
      console.log('✅ API Response received:', {
        status: response.status,
        recordId: response.data.id,
        hasFields: !!response.data.fields
      });
      console.log('📝 Record data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching record:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
      }
      throw new Error('Failed to fetch record from Airtable');
    }
  },
};