# Kurikulum Unggul & Berakhlak — Situs Statis

Situs statis untuk **Panduan Kurikulum Unggul & Berakhlak** Al Akhyar Islamic School,
edisi Tahun Ajaran 2026/2027. Target deploy: **kurikulum.alakhyar.sch.id**.

Beranda + 13 halaman bab. Tombol "Unduh PDF Lengkap" mengarah ke Google Drive
(tidak ada berkas PDF besar yang di-hosting), sehingga seluruh situs hanya ~850 KB —
tanpa framework, tanpa backend, cepat dibuka di desktop maupun mobile.

## Struktur

```
build.mjs        Skrip build (Node): mengkompilasi src/ → dist/
src/
  pages/         Sumber desain (.dc.html) — beranda + 13 bab
  partials/      Nav & Footer sumber
  assets/        Gambar sumber (PNG asli)
  *.pdf          PDF panduan lengkap
dist/            HASIL BUILD — inilah yang di-upload ke server
```

`dist/` sudah berisi hasil build siap-deploy. Anda tidak perlu menjalankan build
kecuali mengubah isi/konten.

## Build ulang

Butuh Node.js 18+ dan `sips` (bawaan macOS, untuk optimasi gambar).

```bash
# 1. Optimasi gambar (hanya perlu jika mengganti gambar di src/assets)
#    Foto → JPEG (maks 1400px, q80); logo/diagram → PNG diperkecil.
#    Lihat perintah sips di riwayat / sesuaikan seperlunya.

# 2. Kompilasi halaman
node build.mjs
```

Build menghasilkan seluruh halaman, `sitemap.xml`, `robots.txt`, dan `404.html` di `dist/`.

## Deploy

Cukup salin isi folder `dist/` ke root web server.

### Nginx (contoh)

```nginx
server {
    listen 80;
    server_name kurikulum.alakhyar.sch.id;
    root /var/www/kurikulum/dist;
    index index.html;

    # URL bersih & 404 kustom
    error_page 404 /404.html;
    location / { try_files $uri $uri.html $uri/ =404; }

    # Cache aset statis
    location ~* \.(css|js|png|jpg|jpeg|webp|woff2?|pdf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    gzip on;
    gzip_types text/html text/css application/javascript image/svg+xml;
}
```

Lalu pasang HTTPS (mis. `certbot --nginx -d kurikulum.alakhyar.sch.id`).

### Caddy (contoh, HTTPS otomatis)

```
kurikulum.alakhyar.sch.id {
    root * /var/www/kurikulum/dist
    file_server
    try_files {path} {path}.html {path}/ /404.html
    encode gzip zstd
}
```

## Pemeliharaan (~sekali per tahun ajaran)

1. Perbarui teks di `src/pages/*.dc.html` (atau langsung di `dist/*.html`).
2. Untuk mengganti tautan PDF, edit konstanta `PDF` di `build.mjs` (saat ini
   menunjuk ke Google Drive). Tombol PDF membuka tautan di tab baru.
3. `node build.mjs`, lalu upload ulang `dist/`.

## Catatan teknis

- **Font**: Plus Jakarta Sans + Poppins via Google Fonts (dengan `preconnect` + `display=swap`).
  Untuk tampil sepenuhnya offline/independen, unduh berkas woff2 dan ganti tautan di `build.mjs`.
- **Responsif**: grid mengecil otomatis (`styles.css`) — 1 kolom di ponsel, tabel dapat digeser
  horizontal, baris chip bab menggulir dan otomatis menyorot bab aktif.
- **SEO**: tiap halaman punya title, meta description, Open Graph, canonical; plus sitemap & robots.
