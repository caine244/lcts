ELECTUS Finance Pro v16

Açmak için index.html dosyasına çift tıklayın.

Backend artık JSON dosyası yerine Postgres kullanır.

Gerekli backend ortam değişkenleri:
- DATABASE_URL
- DATABASE_SSL=true (Render için önerilir)
- MAX_BACKUPS=1000 (sunucuda tutulacak snapshot sayısı)
- BACKUP_CRON_SECRET (haftalık cron yedek tetikleme anahtarı)

İlk giriş:
Kullanıcı adı: admin
Şifre: 1234

Veri kaybı neden oluyordu?
- Uygulama JSON'dan Postgres'e geçtiği için aktif kaynak database oldu.
- Boş/default database ile yazma olursa eski kayıtlar overwrite edilebiliyordu.

Kalıcı korumalar (aktif):
- Her kaydetme öncesi otomatik sunucu snapshot yedeği alınır.
- Ayarlar ekranından sunucu snapshot listesi görülebilir, manuel yedek oluşturulabilir ve geri yükleme yapılabilir.
- Backend okunamazsa istemci boş veriyle sunucuyu overwrite etmez.
- Tarayıcı IndexedDB yedeği fallback olarak kullanılır.
- Tüm veriyi silme işleminde "SIFIRLA" yazılı onay zorunludur.

Render cron ayarı:
- [render.yaml](render.yaml) içinde haftalık pazartesi 03:00 snapshot görevi tanımlıdır.
- Cron servisinde BACKEND_URL degeri sadece backend kok adresi olmalidir (ornek: https://lcts-backend.onrender.com). Sonuna /api eklemeyin.

v16 değişiklikleri:
- Ayarlar bölümüne yönetici şifresinden bağımsız dönem kilidi şifresi belirleme alanı eklendi.
- Kilitli dönemlerde düzenleme ve kilit açma işlemleri bu ayrı şifreyle doğrulanır.
- Performans Merkezi haftalık, aylık ve yıllık gerçek takvim dönemleriyle yeniden yazıldı.
- 12 aylık karşılaştırma, en güçlü/zayıf ay ve ortalamalar eklendi.
- Tema Mağazası ve tema düğmesi kaldırıldı; uygulama tek kurumsal görünümle çalışır.
- Denetim kayıtları silinemez ve şifre değişiklikleri kayda alınır.
