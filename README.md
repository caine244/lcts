ELECTUS Finance Pro v16

Açmak için index.html dosyasına çift tıklayın.

Backend artık JSON dosyası yerine Postgres kullanır.

Gerekli backend ortam değişkenleri:
- DATABASE_URL
- DATABASE_SSL=true (Render için önerilir)

İlk giriş:
Kullanıcı adı: admin
Şifre: 1234

v16 değişiklikleri:
- Ayarlar bölümüne yönetici şifresinden bağımsız dönem kilidi şifresi belirleme alanı eklendi.
- Kilitli dönemlerde düzenleme ve kilit açma işlemleri bu ayrı şifreyle doğrulanır.
- Performans Merkezi haftalık, aylık ve yıllık gerçek takvim dönemleriyle yeniden yazıldı.
- 12 aylık karşılaştırma, en güçlü/zayıf ay ve ortalamalar eklendi.
- Tema Mağazası ve tema düğmesi kaldırıldı; uygulama tek kurumsal görünümle çalışır.
- Denetim kayıtları silinemez ve şifre değişiklikleri kayda alınır.
