import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'backend', 'data', 'database.json');

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(rootDir)));

const defaultData = {
  transactions: [],
  payments: [],
  users: [{ username: 'arda', name: 'ELECTUS Yönetici', role: 'admin', password: '293364' }],
  settings: {
    eurRate: 53.44,
    usdRate: 46.0,
    baseCurrency: 'TRY',
    autoRates: true,
    lastRateUpdate: null,
    rateSource: 'Frankfurter',
    paymentNotifications: true,
    notifyDaysBefore: 0,
    notifiedPayments: {}
  },
  audit: [],
  meta: { version: 12, lastBackup: null }
};

function ensureDataFile() {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

function deepMerge(target, source) {
  if (Array.isArray(source)) {
    return source;
  }
  if (source && typeof source === 'object') {
    const result = Array.isArray(target) ? [] : { ...(target || {}) };
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = deepMerge(result[key], value);
      } else {
        result[key] = structuredClone(value);
      }
    }
    return result;
  }
  return source ?? target;
}

function loadData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Veri dosyası okunurken hata oluştu:', error);
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  const tempPath = `${dataPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, dataPath);
}

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/data', (req, res) => {
  res.json(loadData());
});

app.post('/api/data', (req, res) => {
  const payload = req.body || {};
  const data = deepMerge(structuredClone(defaultData), payload);
  saveData(data);
  res.json({ success: true, data });
});

app.get('/api/:collection', (req, res) => {
  const collection = req.params.collection;
  const data = loadData();
  if (!Object.hasOwn(data, collection)) {
    return res.status(404).json({ error: 'Collection not found' });
  }
  res.json(data[collection]);
});

app.post('/api/:collection', (req, res) => {
  const collection = req.params.collection;
  const item = req.body;
  const data = loadData();

  if (!Object.hasOwn(data, collection) || typeof data[collection] === 'object' && !Array.isArray(data[collection])) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  data[collection].push(item);
  saveData(data);
  res.json({ success: true, item });
});

app.put('/api/:collection/:id', (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  const changes = req.body;
  const data = loadData();

  if (!Array.isArray(data[collection])) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  const index = data[collection].findIndex((item) => String(item.id ?? item.username ?? item.name) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  data[collection][index] = { ...data[collection][index], ...changes };
  saveData(data);
  res.json({ success: true, item: data[collection][index] });
});

app.delete('/api/:collection/:id', (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  const data = loadData();

  if (!Array.isArray(data[collection])) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  const originalLength = data[collection].length;
  data[collection] = data[collection].filter((item) => String(item.id ?? item.username ?? item.name) !== String(id));

  if (data[collection].length === originalLength) {
    return res.status(404).json({ error: 'Item not found' });
  }

  saveData(data);
  res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ELECTUS backend çalışıyor: http://localhost:${PORT}`);
  console.log(`Ağ üzerinden erişim için: http://0.0.0.0:${PORT}`);
});
