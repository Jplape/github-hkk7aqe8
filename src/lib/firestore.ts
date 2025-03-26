// Mock Firestore implementation
import type { InterventionReport } from '../store/reportStore';

const mockDb = {
  reports: new Map<string, InterventionReport>(),
  users: new Map(),
  notifications: new Map()
};

let subscriptionCallback: ((reports: InterventionReport[]) => void) | null = null;

export const collections = {
  Reports: {
    id: 'reports'
  },
  Users: {
    id: 'users'
  },
  Notifications: {
    id: 'notifications'
  }
};

// Report sync functions with mock implementation
export const syncInterventionReports = {
  // Save a new report
  async saveReport(reportData: InterventionReport): Promise<string> {
    try {
      mockDb.reports.set(reportData.id, {
        ...reportData,
        updatedAt: new Date().toISOString()
      });
      
      if (subscriptionCallback) {
        subscriptionCallback(Array.from(mockDb.reports.values()));
      }
      
      return reportData.id;
    } catch (error) {
      console.error('Error saving mock report:', error);
      throw error;
    }
  },

  // Update an existing report
  async updateReport(reportId: string, updates: Partial<InterventionReport>): Promise<void> {
    try {
      const existingReport = mockDb.reports.get(reportId);
      if (!existingReport) {
        throw new Error('Report not found');
      }

      const updatedReport = {
        ...existingReport,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      mockDb.reports.set(reportId, updatedReport);
      
      if (subscriptionCallback) {
        subscriptionCallback(Array.from(mockDb.reports.values()));
      }
    } catch (error) {
      console.error('Error updating mock report:', error);
      throw error;
    }
  },

  // Subscribe to report changes
  subscribeToReports(callback: (reports: InterventionReport[]) => void): () => void {
    subscriptionCallback = callback;
    callback(Array.from(mockDb.reports.values()));

    return () => {
      subscriptionCallback = null;
    };
  }
};