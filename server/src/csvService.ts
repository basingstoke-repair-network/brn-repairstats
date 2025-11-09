import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { RepairItem, RepairStats } from './types';

export class CSVService {
  private csvPath: string;

  constructor(csvPath?: string) {
    this.csvPath = csvPath || path.join(__dirname, '../../repairs.csv');
  }

  async readRepairs(): Promise<RepairItem[]> {
    return new Promise((resolve, reject) => {
      const results: RepairItem[] = [];
      
      if (!fs.existsSync(this.csvPath)) {
        reject(new Error(`CSV file not found at ${this.csvPath}`));
        return;
      }

      fs.createReadStream(this.csvPath)
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim()
        }))
        .on('data', (data) => {
          const item: RepairItem = {
            number: parseInt(data.number) || 0,
            title: data.title?.trim() || '',
            status: data.status?.trim() || '',
            type: data.type?.trim() || '',
            owner: data.owner?.trim() || '',
            repairer: data.repairer?.trim() || ''
          };
          results.push(item);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getStats(): Promise<RepairStats> {
    const repairs = await this.readRepairs();
    
    const stats: RepairStats = {
      total: repairs.length,
      fixed: 0,
      failed: 0,
      waiting: 0,
      started: 0,
      byType: {},
      byStatus: {}
    };

    repairs.forEach(repair => {
      // Count by status
      switch (repair.status.toLowerCase()) {
        case 'fixed':
        case 'f':
        case 'y':
          stats.fixed++;
          break;
        case 'failed':
        case 'x':
        case 'n':
          stats.failed++;
          break;
        case 'waiting':
        case 'w':
          stats.waiting++;
          break;
        case 'started':
        case 's':
          stats.started++;
          break;
      }

      // Count by type
      stats.byType[repair.type] = (stats.byType[repair.type] || 0) + 1;
      
      // Count by status (raw)
      stats.byStatus[repair.status] = (stats.byStatus[repair.status] || 0) + 1;
    });

    return stats;
  }

  getSortedRepairs(repairs: RepairItem[]): RepairItem[] {
    // Sort by number then by status (mimicking the Typst logic)
    return repairs
      .sort((a, b) => a.number - b.number)
      .reverse()
      .sort((a, b) => a.status.localeCompare(b.status))
      .reverse();
  }
}