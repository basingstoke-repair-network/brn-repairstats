export interface RepairItem {
  number: number;
  title: string;
  status: 'fixed' | 'failed' | 'waiting' | 'started' | 'home' | 'return' | string;
  type: 'electrical' | 'mechanical' | 'sewing' | 'wood' | 'computer' | 'other' | string;
  owner: string;
  repairer: string;
}

export interface RepairStats {
  total: number;
  fixed: number;
  failed: number;
  waiting: number;
  started: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}