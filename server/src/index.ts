import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { CSVService } from './csvService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize CSV service
const csvService = new CSVService();

// Routes
app.get('/api/repairs', async (req, res) => {
  try {
    const repairs = await csvService.readRepairs();
    const sortedRepairs = csvService.getSortedRepairs(repairs);
    res.json(sortedRepairs);
  } catch (error) {
    console.error('Error reading repairs:', error);
    res.status(500).json({ error: 'Failed to read repairs data' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await csvService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get repair statistics' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});