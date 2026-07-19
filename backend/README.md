# ELECTUS Backend Scaffold

Bu dizin, mevcut `index.html` tabanlı ELECTUS ön yüzünü bozmadan çalışacak bir Node.js/Express backend iskeleti sağlar.

## Kurulum

1. `cd backend`
2. `npm install`
3. `npm start`
4. Tarayıcınızda `http://localhost:3000` adresini açın

## Özellikler

- `GET /api/status` - servis durumu
- `GET /api/data` - tüm veri setini okur
- `POST /api/data` - mevcut veri setini yazar
- `GET /api/:collection` - `transactions`, `payments`, `users`, `settings`, `audit` için veri
- `POST /api/:collection` - koleksiyona yeni kayıt ekler
- `PUT /api/:collection/:id` - kayıt güncelleme
- `DELETE /api/:collection/:id` - kayıt silme

## Notlar

- Bu backend, `backend/data/database.json` dosyasına veri yazar.
- Mevcut statik yapı korunur; frontend için API entegrasyonu ayrıca yapılmalıdır.
