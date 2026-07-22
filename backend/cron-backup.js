const backendUrl = String(process.env.BACKEND_URL || '').trim();
const backupSecret = String(process.env.BACKUP_CRON_SECRET || '').trim();

if (!backendUrl) {
  console.error('Cron hata: BACKEND_URL tanimli degil.');
  process.exit(1);
}

if (!backupSecret) {
  console.error('Cron hata: BACKUP_CRON_SECRET tanimli degil.');
  process.exit(1);
}

const endpoint = new URL('/api/internal/backup-snapshot', backendUrl).toString();

try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-backup-secret': backupSecret
    }
  });

  const bodyText = await response.text();

  if (!response.ok) {
    console.error(`Cron hata: ${response.status} ${response.statusText}`);
    if (bodyText) {
      console.error(bodyText);
    }
    process.exit(1);
  }

  console.log('Cron yedek basarili.');
  if (bodyText) {
    console.log(bodyText);
  }
} catch (error) {
  console.error('Cron istek hatasi:', error?.message || error);
  process.exit(1);
}
