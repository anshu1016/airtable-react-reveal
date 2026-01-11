import { AirtableResponse, AirtableRecord } from '../types/airtable';
import { demoRecords } from './demoData';
import { supabase } from '@/integrations/supabase/client';

// Check if we should use the backend proxy (no credentials means use demo or proxy)
const USE_DEMO_DATA = false; // Set to true to force demo data

export const airtableAPI = {
  async getAllRecords(): Promise<AirtableRecord[]> {
    console.log('🔍 Fetching all records via backend proxy...');

    if (USE_DEMO_DATA) {
      console.log('⚠️  Using demo data');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('📊 Demo data loaded:', demoRecords.length, 'records');
      return demoRecords;
    }

    try {
      console.log('🌐 Making request via backend proxy');
      const { data, error } = await supabase.functions.invoke('airtable-proxy', {
        body: { action: 'getAllRecords' }
      });

      if (error) {
        console.error('❌ Backend proxy error:', error);
        throw new Error(error.message || 'Failed to fetch records');
      }

      const records = data.records || [];
      console.log('✅ Records received:', records.length, 'records');
      return records;
    } catch (error) {
      console.error('❌ Error fetching records:', error);
      throw new Error('Failed to fetch records from Airtable');
    }
  },

  async getRecord(recordId: string): Promise<AirtableRecord> {
    console.log('🔍 Fetching single record via backend proxy:', recordId);

    if (USE_DEMO_DATA) {
      console.log('⚠️  Using demo data');
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
      console.log('🌐 Making request via backend proxy');
      const { data, error } = await supabase.functions.invoke('airtable-proxy', {
        body: { action: 'getRecord', recordId }
      });

      if (error) {
        console.error('❌ Backend proxy error:', error);
        throw new Error(error.message || 'Failed to fetch record');
      }

      console.log('✅ Record received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching record:', error);
      throw new Error('Failed to fetch record from Airtable');
    }
  },
};
