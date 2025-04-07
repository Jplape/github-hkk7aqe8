import { supabase } from './supabase';

export const syncInterventionReports = {
  subscribeToReports: (callback: (reports: any[]) => void) => {
    const subscription = supabase
      .channel('reports-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'intervention_reports'
      }, (payload) => {
        callback([payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },

  addReport: async (reportData: any) => {
    const { data, error } = await supabase
      .from('report')
      .insert(reportData)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  saveReport: async (report: any) => {
    const { data, error } = await supabase
      .from('report')
      .upsert(report)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  updateReport: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('report')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }
};