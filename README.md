# Çalışan Giriş Sistemi + Admin Güvenlik Paneli

Gerçek, localde çalıştırılabilir bir proje. **Backend**: Node.js + Express + dosya tabanlı JSON veritabanı (native derleme gerekmez, Termux dahil her yerde çalışır; şifreler bcrypt ile hashlenir, oturumlar JWT ile). **Frontend**: React + Vite + Tailwind CSS.

## Kurulum senaryonuz: Termux (Android) + Tailscale + iPhone Safari

Bu proje özellikle şu kurulum için ayarlandı:
- **Sunucu**: Android telefonda Termux üzerinde çalışır (hem backend hem frontend)
- **İstemci**: iPhone'dan Safari ile, Tailscale özel ağı üzerinden erişilir

### A) Android tarafı (Termux)

1. Termux'u [F-Droid](https://f-droid.org/packages/com.termux/) üzerinden kurun (Play Store'daki sürüm güncel değil).
2. Termux'ta gerekli paketleri kurun:
   ```bash
   pkg update && pkg upgrade
   pkg install nodejs git
   ```
3. Bu projeyi Termux'a aktarın (zip'i Android'e indirip Termux'tan erişilebilir bir klasöre — ör. `~/storage/downloads` — çıkarabilir, veya `termux-setup-storage` çalıştırıp Downloads klasörüne kopyalayabilirsiniz).
4. **Tailscale'i Android'e kurun** (Play Store'dan "Tailscale" uygulaması) ve aynı hesapla giriş yapın. Uygulama açıkken cihazınıza bir Tailscale IP'si (100.x.y.z formatında) atanır — bunu Tailscale uygulamasının ana ekranında görebilirsiniz.

### B) Backend'i Termux'ta başlatın
```bash
cd server
npm install
cp .env.example .env
node index.js
```
Çıktıda `Sunucu http://0.0.0.0:4000 adresinde çalışıyor` yazısını görmelisiniz. İlk çalıştırmada otomatik oluşturulan admin hesabı:
- **Kullanıcı adı:** `admin`
- **Şifre:** `admin123`

### C) Frontend'i Termux'ta başlatın (yeni bir Termux sekmesi açın: ekranı sola kaydırıp "New session")
```bash
cd client
npm install
npm run dev
```
`http://0.0.0.0:5173` üzerinde çalışmaya başlar (dışarıdan erişime açık).

### D) iPhone tarafı
1. **Tailscale**'i App Store'dan kurun, Android ile **aynı hesapla** giriş yapın.
2. Safari'yi açın, adres çubuğuna Android'in Tailscale IP'sini yazın:
   ```
   http://100.x.y.z:5173
   ```
   (x.y.z kısmını Android'deki Tailscale uygulamasından aldığınız gerçek IP ile değiştirin)
3. Giriş ekranını görmelisiniz — `admin` / `admin123` ile giriş yapabilirsiniz.

**Not:** Telefon kilitlenirse veya Termux arka plana atılırsa Android bazı cihazlarda süreci durdurabilir. Kesintisiz çalışması için Termux bildirimini (Termux:API veya "Acquire wakelock" seçeneği, Termux bildirim çubuğunda) etkinleştirmeniz veya pil optimizasyonundan Termux'u hariç tutmanız önerilir.

---

## Standart bilgisayar kurulumu (Termux olmadan)

### Gereksinimler
- [Node.js](https://nodejs.org) (v18 veya üzeri)

### 1) Backend'i çalıştırın
```bash
cd server
npm install
cp .env.example .env
node index.js
```

### 2) Frontend'i çalıştırın (yeni bir terminal sekmesinde)
```bash
cd client
npm install
npm run dev
```
Tarayıcıda `http://localhost:5173` adresini açın.

## Nasıl çalışıyor
- Çalışanlar giriş yapar → `employee` rolüyle basit bir panel görür.
- `admin` rolüyle giriş yapılırsa **Güvenlik Paneli** açılır:
  - Tüm giriş denemeleri (başarılı/başarısız) **gerçek IP adresi**, tarayıcı bilgisi ve zaman damgasıyla kaydedilir.
  - Aynı kullanıcı adına 5 dakika içinde art arda **3 başarısız deneme** olursa "İZİNSİZ GİRİŞ ŞÜPHESİ" olarak işaretlenir.
  - Panel 4 saniyede bir otomatik yenilenir (yeni girişler anlık görünür).
  - Çalışanlar sekmesinden yeni çalışan ekleyip silebilirsiniz.

## Veriler nerede saklanıyor?
`server/data.json` dosyasında (düz JSON, native veritabanı bağımlılığı yok) — bu dosyayı silerseniz tüm kullanıcılar ve loglar sıfırlanır (admin hesabı yeniden oluşturulur).

## Production / gerçek sunucuya taşımak isterseniz
- `server/.env` içindeki `JWT_SECRET` değerini mutlaka uzun, rastgele bir değerle değiştirin.
- Frontend'i `npm run build` ile derleyip (client klasöründe) `dist/` klasörünü bir web sunucusundan (nginx, vs.) veya backend'in kendisinden statik olarak servis edebilirsiniz.
- HTTPS kullanmadan gerçek şifrelerle interneti açık bırakmayın. Tailscale özel ağı üzerinden kullanmak (bu kurulumda olduğu gibi) internete açık olmadığından ek bir güvenlik katmanı sağlar.

