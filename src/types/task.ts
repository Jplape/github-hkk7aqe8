export interface Client {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  email?: string;
}

export interface TimeRange {
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface TaskEquipment {
  id?: string;
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'maintenance' | 'intervention';
export type MaintenanceType = 'preventive' | 'corrective';
export type TaskOrigin = 'local' | 'remote';

export interface BaseTask {
  id: string;
  title: string;
  client_id?: string; // Référence optionnelle vers client.id
  date: string; // ISO date format (YYYY-MM-DD)
  time: TimeRange;
  duration: number; // in minutes
  technicianId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  problem?: string;
  description?: string;
  equipment?: TaskEquipment;
  type?: TaskType;
  maintenanceType?: MaintenanceType;
  parts?: string[];
  cost?: number;
  nextMaintenanceDate?: string; // ISO date format
  actions?: string[];
  reportId?: string;
  origin?: TaskOrigin;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'pending_deletion';

export interface Task extends BaseTask {
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  _status?: SyncStatus; // For local sync state tracking
}

// Type pour les lignes Supabase
export interface TaskRow extends BaseTask {
  created_at: string;
  updated_at: string;
  assigned_to?: string; // Correspond à technicianId
}

// Type pour les changements de tâche
export interface TaskChange {
  new: Task | null;
  old: Task | null;
}

export interface TaskChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Task | null;
  old: Task | null;
  schema: string;
  table: string;
  commit_timestamp: string;
}