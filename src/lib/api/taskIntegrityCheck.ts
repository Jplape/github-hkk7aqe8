import { supabase } from '../supabase';

type IntegrityResult = {
  missing_count: number;
  missing_ids: string[];
  time_analysis: Array<{
    interval: string;
    count: number;
    sample_ids: string[];
  }>;
};

export async function checkTaskIntegrity(): Promise<IntegrityResult> {
  const { data, error } = await supabase.rpc('check_task_integrity');
  
  if (error) {
    console.error('Task integrity check failed:', error);
    throw new Error('Failed to verify task integrity');
  }

  return {
    missing_count: data?.result?.missing_count || 0,
    missing_ids: data?.result?.missing_ids || [],
    time_analysis: data?.result?.time_analysis || []
  };
}