import { AirtableRecord } from '../types/airtable';
import { demoRecords } from './demoData';

// Use demo data - set to false to use Supabase backend
const USE_DEMO_DATA = true;

// Lazy load supabase client to avoid initialization errors
const getSupabaseClient = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  return supabase;
};

export const airtableAPI = {
  async getAllRecords(): Promise<AirtableRecord[]> {
    console.log('🔍 Fetching all records...');

    if (USE_DEMO_DATA) {
      console.log('⚠️  Using demo data');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('📊 Demo data loaded:', demoRecords.length, 'records');
      return demoRecords;
    }

    try {
      console.log('🌐 Making request via backend proxy');
      const supabase = await getSupabaseClient();
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
      console.log('⚠️ Falling back to demo data');
      return demoRecords;
    }
  },

  async getRecord(recordId: string): Promise<AirtableRecord> {
    console.log('🔍 Fetching single record:', recordId);

    if (USE_DEMO_DATA) {
      console.log('⚠️  Using demo data');
      await new Promise(resolve => setTimeout(resolve, 300));
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
      const supabase = await getSupabaseClient();
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
      const record = demoRecords.find(r => r.id === recordId);
      if (record) return record;
      throw new Error('Failed to fetch record from Airtable');
    }
  },
};
