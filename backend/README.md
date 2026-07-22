# ELECTUS Backend Scaffold

Bu dizin, mevcut `index.html` tabanlı ELECTUS ön yüzünü bozmadan çalışacak bir Node.js/Express backend iskeleti sağlar.

## Kurulum

1. `cd backend`
2. `npm install`
3. `.env.example` dosyasını kopyalayıp `.env` olarak düzenleyin
4. `npm start`
5. Tarayıcınızda `http://localhost:3000` adresini açın

## Özellikler

- `GET /api/status` - servis durumu
- `GET /api/data` - tüm veri setini okur
- `POST /api/data` - mevcut veri setini yazar
- `GET /api/backups` - snapshot yedek listesini verir (admin header gerekli)
- `POST /api/backups/create` - manuel snapshot yedek alır (admin header gerekli)
- `POST /api/backups/restore/:id` - snapshot geri yükler (admin header gerekli)
- `POST /api/internal/backup-snapshot` - cron ile snapshot alır (`x-backup-secret` gerekli)
- `GET /api/:collection` - `transactions`, `payments`, `users`, `settings`, `audit` için veri
- `POST /api/:collection` - koleksiyona yeni kayıt ekler
- `PUT /api/:collection/:id` - kayıt güncelleme
- `DELETE /api/:collection/:id` - kayıt silme

## Ortam Değişkenleri

- `DATABASE_URL` (zorunlu)
- `DATABASE_SSL` (production için `true` önerilir)
- `MAX_BACKUPS` (varsayılan `500`, saklanacak max snapshot sayısı)
- `BACKUP_CRON_SECRET` (cron snapshot endpoint doğrulaması)

## Admin Header Doğrulaması

Yedek endpoint'leri aşağıdaki header'lar ile korunur:

- `x-admin-user`
- `x-admin-pass`

Bu kimlik bilgileri, mevcut veri içindeki admin kullanıcısıyla eşleşmelidir.

## Notlar

- Aktif veri kaynağı Postgres'tir.
- `backend/data/database.json` dosyası yalnızca Postgres ilk açılışta boşsa bootstrap yedeği olarak okunur.
