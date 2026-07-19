# ELECTUS Finance Pro v20 — Yayın Paketi

Bu klasör doğrudan **Netlify, Vercel, Cloudflare Pages veya GitHub Pages** üzerinde yayınlanabilir.

## En kolay yayınlama: Netlify Drop
1. Netlify hesabına giriş yapın.
2. “Add new site” / “Deploy manually” alanını açın.
3. Bu klasörün tamamını veya teslim ZIP’ini yükleyin.
4. Sistem otomatik olarak herkese açık HTTPS bağlantısı üretir.

## Vercel
1. Yeni proje oluşturun.
2. Bu klasörü GitHub deposuna yükleyip içe aktarın veya Vercel CLI kullanın.
3. Framework seçimini “Other” bırakın; build komutu gerekmez, output dizini `.` olur.

## Önemli veri modeli notu
Bu sürüm verileri IndexedDB ve localStorage ile **kullanıcının kendi tarayıcısında** saklar. Yayın linkini açan her cihazın verisi ayrıdır. Ortak hesaplar, merkezi veritabanı, gerçek kullanıcı yetkilendirmesi ve cihazlar arası senkronizasyon bu statik paketin kapsamında değildir.

## Kurulum
HTTPS üzerinden açıldığında uygulama desteklenen tarayıcılarda telefona/bilgisayara PWA olarak kurulabilir ve temel ekranlar çevrimdışı açılabilir.

## İlk giriş
- Kullanıcı adı: `admin`
- Şifre: `1234`

İlk girişten sonra yönetici şifresini Ayarlar bölümünden değiştirin.
