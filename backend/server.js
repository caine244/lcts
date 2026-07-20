import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const { Pool } = pg;

if (!DATABASE_URL) {
  console.error('DATABASE_URL tanimlanmadi. Uygulama Postgres olmadan baslatilmaz.');
  process.exit(1);
}

const useSsl = (process.env.DATABASE_SSL || '').toLowerCase() === 'true'
  || (process.env.NODE_ENV === 'production' && (process.env.DATABASE_SSL || '').toLowerCase() !== 'false');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

app.disable('etag');
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(rootDir), {
  maxAge: 0,
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.json')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }
}));

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
  meta: { version: 13, lastBackup: null }
};

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

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT app_state_single_row CHECK (id = 1)
      )
    `);
    await pool.query(
      `INSERT INTO app_state (id, data)
       VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify(defaultData)]
    );
  } catch (error) {
    console.error('Postgres hazirlanirken hata olustu:', error);
    throw error;
  }
}

async function loadData() {
  try {
    const result = await pool.query('SELECT data FROM app_state WHERE id = 1');
    const stored = result.rows[0]?.data;
    return deepMerge(structuredClone(defaultData), stored || {});
  } catch (error) {
    console.error('Postgres verisi okunurken hata olustu:', error);
    throw error;
  }
}

async function saveData(data) {
  const mergedData = deepMerge(structuredClone(defaultData), data);
  try {
    await pool.query(
      `INSERT INTO app_state (id, data, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [JSON.stringify(mergedData)]
    );
    return mergedData;
  } catch (error) {
    console.error('Postgres verisi kaydedilirken hata olustu:', error);
    throw error;
  }
}

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/data', async (req, res) => {
  try {
    res.json(await loadData());
  } catch (error) {
    res.status(500).json({ error: 'Veri okunamadi' });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await saveData(payload);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Veri kaydedilemedi' });
  }
});

app.get('/api/:collection', async (req, res) => {
  try {
    const collection = req.params.collection;
    const data = await loadData();
    if (!Object.hasOwn(data, collection)) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(data[collection]);
  } catch (error) {
    res.status(500).json({ error: 'Veri okunamadi' });
  }
});

app.post('/api/:collection', async (req, res) => {
  try {
    const collection = req.params.collection;
    const item = req.body;
    const data = await loadData();

    if (!Object.hasOwn(data, collection) || typeof data[collection] === 'object' && !Array.isArray(data[collection])) {
      return res.status(400).json({ error: 'Invalid collection' });
    }

    data[collection].push(item);
    await saveData(data);
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Veri kaydedilemedi' });
  }
});

app.put('/api/:collection/:id', async (req, res) => {
  try {
    const collection = req.params.collection;
    const id = req.params.id;
    const changes = req.body;
    const data = await loadData();

    if (!Array.isArray(data[collection])) {
      return res.status(400).json({ error: 'Invalid collection' });
    }

    const index = data[collection].findIndex((item) => String(item.id ?? item.username ?? item.name) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    data[collection][index] = { ...data[collection][index], ...changes };
    await saveData(data);
    res.json({ success: true, item: data[collection][index] });
  } catch (error) {
    res.status(500).json({ error: 'Veri guncellenemedi' });
  }
});

app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const collection = req.params.collection;
    const id = req.params.id;
    const data = await loadData();

    if (!Array.isArray(data[collection])) {
      return res.status(400).json({ error: 'Invalid collection' });
    }

    const originalLength = data[collection].length;
    data[collection] = data[collection].filter((item) => String(item.id ?? item.username ?? item.name) !== String(id));

    if (data[collection].length === originalLength) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await saveData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Veri silinemedi' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`ELECTUS backend calisiyor: http://localhost:${PORT}`);
      console.log(`Postgres baglantisi hazir.`);
    });
  })
  .catch(() => {
    process.exit(1);
  });
