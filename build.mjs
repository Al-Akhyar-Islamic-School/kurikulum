/* ============================================================
   Build: Kurikulum Unggul & Berakhlak — static site
   Compiles the prototype .dc.html design references in src/pages
   into clean, self-contained static HTML in dist/.
   Run: node build.mjs
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dir, 'src');
const DIST = join(__dir, 'dist');

const PDF = 'https://drive.google.com/file/d/1-ls1tElXDAGdDhXB4XroduaR1XTCApEV/view?usp=sharing';
const SITE_URL = 'https://kurikulum.alakhyar.sch.id';

/* Chapter metadata (source of truth for nav chips + homepage grid) */
const CH = [
  { n:1,  roman:'I',    nav:'Pendahuluan',        title:'Pendahuluan',                                  desc:'Latar belakang, landasan, visi-misi, karakteristik satuan pendidikan.', file:'bab-1-pendahuluan.html',                color:'#006195' },
  { n:2,  roman:'II',   nav:'Profil Lulusan',     title:'Profil Lulusan Al Akhyar',                     desc:'Iman, Ilmu, Ihsan — delapan dimensi & indikator per jenjang.',          file:'bab-2-profil-lulusan.html',             color:'#EC2A6B' },
  { n:3,  roman:'III',  nav:'Struktur Kurikulum', title:'Struktur Kurikulum per Jenjang',               desc:'KB, TK, SD, SMP, SMA — beban belajar & peminatan.',                     file:'bab-3-struktur-kurikulum.html',         color:'#006195' },
  { n:4,  roman:'IV',   nav:'Pengorganisasian',   title:'Pengorganisasian Pembelajaran',                desc:'Intrakurikuler, kokurikuler & 7KAIH, ekstrakurikuler.',                 file:'bab-4-pengorganisasian.html',           color:'#1B93C6' },
  { n:5,  roman:'V',    nav:'Program & Kalender',  title:'Program Unggulan & Kalender Akademik',        desc:'Program lintas jenjang & tonggak Tahun Ajaran 2026/2027.',              file:'bab-5-program-kalender.html',           color:'#E8493F' },
  { n:6,  roman:'VI',   nav:'Tahfidz & Hadits',    title:'Kurikulum Tahfidz dan Hadits',                desc:'Metode, target hafalan, dan asesmen.',                                  file:'bab-6-tahfidz-hadits.html',             color:'#218A62' },
  { n:7,  roman:'VII',  nav:'Poinku',             title:'Sistem Kesiswaan: Poinku',                     desc:'Poin Akhlak, Poin Unggul, beasiswa.',                                   file:'bab-7-poinku.html',                     color:'#B9790C' },
  { n:8,  roman:'VIII', nav:'Dinar App',          title:'Sistem Informasi: Dinar App',                  desc:'Fitur, akses, dan tata kelola akun.',                                   file:'bab-8-dinar-app.html',                  color:'#1B93C6' },
  { n:9,  roman:'IX',   nav:'Perencanaan',        title:'Perencanaan & Pembelajaran Mendalam',          desc:'CP → ATP → Modul Ajar, deep learning.',                                 file:'bab-9-perencanaan-pembelajaran.html',   color:'#006195' },
  { n:10, roman:'X',    nav:'Asesmen',            title:'Asesmen & Evaluasi Pembelajaran',              desc:'Prinsip, jenis instrumen, pelaporan hasil belajar.',                    file:'bab-10-asesmen-evaluasi.html',          color:'#EC2A6B' },
  { n:11, roman:'XI',   nav:'Evaluasi Kurikulum', title:'Evaluasi Kurikulum & Pengembangan Profesional',desc:'OKR, kompetensi guru, pendampingan.',                                   file:'bab-11-evaluasi-kurikulum.html',        color:'#218A62' },
  { n:12, roman:'XII',  nav:'Tata Tertib',        title:'Tata Tertib, Kemitraan Sekolah, & Mars Al Akhyar', desc:'Kehadiran, gadget, keuangan, perlindungan guru.',                   file:'bab-12-tata-tertib.html',               color:'#B9790C' },
  { n:13, roman:'XIII', nav:'Penutup',            title:'Penutup & Glosarium',                          desc:'Pesan penutup dan istilah kurikulum.',                                  file:'bab-13-penutup.html',                   color:'#1B93C6' },
];

/* Map original .dc.html filenames -> clean output filenames */
const FILEMAP = { 'kurikulum-web-beranda.dc.html': 'index.html' };
for (const c of CH) {
  const src = `kurikulum-web-bab-${String(c.n).padStart(2,'0')}-${c.file.replace(/^bab-\d+-/, '').replace('.html','')}.dc.html`;
  FILEMAP[src] = c.file;
}

/* Photos converted to JPEG during image optimisation */
const JPEG_ASSETS = ['cover','foto-coding-sma','foto-dinar-app','foto-smp-belajar','foto-tk-berpetualang','foto-tk-praktek','siswa-sd-belajar-cropped','siswa-sd-mengaji','siswa-sd-taman','siswa-sma-belajar'];

/* ---------- shared partials ---------- */
function renderNav(active) {
  const chips = CH.map(c => {
    const on = c.n === active;
    const bg = on ? c.color : '#F5F8FA';
    const fg = on ? '#fff' : '#3F4B55';
    return `<a href="${c.file}" aria-current="${on ? 'page' : 'false'}" style="flex-shrink:0; display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:999px; text-decoration:none; white-space:nowrap; background:${bg};">
        <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:800; color:${fg}; opacity:0.7;">${c.roman}</span>
        <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:11.5px; font-weight:700; color:${fg};">${c.nav}</span>
      </a>`;
  }).join('\n      ');
  return `<nav aria-label="Daftar bab kurikulum" style="position:sticky; top:0; z-index:50; background:#fff; border-bottom:1px solid #E1E7ED;">
  <div style="max-width:1180px; margin:0 auto; padding:16px 24px 12px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
    <a href="index.html" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
      <img src="assets/logo-sekolah.png" alt="Logo Sekolah Islam Al Akhyar" width="34" height="34" style="height:34px; width:auto;">
      <div>
        <div style="font-family:'Poppins',sans-serif; font-weight:800; font-size:13.5px; color:#004268; line-height:1.2;">Kurikulum Unggul &amp; Berakhlak</div>
        <div style="font-size:10.5px; color:#6B7683;">Al Akhyar Islamic School</div>
      </div>
    </a>
    <a href="index.html" style="font-size:12.5px; font-weight:700; color:#006195; text-decoration:none; padding:8px 16px; border:1.5px solid #006195; border-radius:999px; flex-shrink:0;">← Beranda</a>
  </div>
  <div id="chapterChips" style="max-width:1180px; margin:0 auto; padding:0 24px 14px 24px; display:flex; gap:8px; overflow-x:auto;">
      ${chips}
  </div>
</nav>
<script>(function(){var r=document.getElementById('chapterChips');if(!r)return;var a=r.querySelector('[aria-current="page"]');if(a)r.scrollLeft=a.offsetLeft-16;})();</script>`;
}

function renderFooter() {
  return `<footer style="background:#F5F8FA; border-top:1px solid #E1E7ED; margin-top:40px;">
  <div style="max-width:1180px; margin:0 auto; padding:32px 24px; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;">
    <div style="max-width:520px;">
      <p style="font-family:'Poppins',sans-serif; font-weight:800; font-size:15px; color:#1E2A32; margin:0 0 4px 0;">Ingin membaca dokumen lengkap?</p>
      <p style="font-size:12.5px; color:#6B7683; line-height:1.6; margin:0;">Ringkasan pada halaman ini disarikan dari Panduan Kurikulum Unggul &amp; Berakhlak edisi Tahun Ajaran 2026/2027. Unduh versi lengkap untuk rincian struktur mapel, tabel, dan lampiran.</p>
    </div>
    <a href="${PDF}" target="_blank" rel="noopener" style="flex-shrink:0; display:inline-flex; align-items:center; gap:8px; background:#006195; color:#fff; text-decoration:none; font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; font-size:13.5px; padding:12px 22px; border-radius:10px;">Unduh PDF Lengkap</a>
  </div>
  <div style="max-width:1180px; margin:0 auto; padding:0 24px 24px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; border-top:1px solid #E1E7ED; padding-top:18px;">
    <p style="font-size:11.5px; color:#6B7683; margin:0;">© 2026 Yayasan Pendidikan Islam Al Akhyar — Jl. Arung Teko No. 99, Sudiang, Biringkanaya, Makassar</p>
    <p style="font-size:11.5px; color:#6B7683; margin:0;">kurikulum.alakhyar.sch.id</p>
  </div>
</footer>`;
}

function navCard(target, dir, accent) {
  // target: chapter object or {file,label,title,roman?}; dir: 'prev' | 'next'
  const isNext = dir === 'next';
  const eyebrow = isNext ? 'Bagian Selanjutnya →' : '← Bagian Sebelumnya';
  const align = isNext ? 'right' : 'left';
  const label = target.roman ? `${target.roman}. ${target.title}` : target.title;
  return `<a href="${target.file}" class="navcard" style="display:block; text-decoration:none; border:1px solid #E1E7ED; border-radius:14px; padding:16px 20px; text-align:${align};">
      <p style="font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7683; font-weight:800; margin:0 0 5px 0;">${eyebrow}</p>
      <p style="font-family:'Poppins',sans-serif; font-weight:700; font-size:14.5px; color:${accent}; margin:0;">${label}</p>
    </a>`;
}

function renderChapterNav(n) {
  const cur = CH.find(c => c.n === n);
  const prev = n === 1 ? { file:'index.html', title:'Kembali ke Beranda' } : CH.find(c => c.n === n - 1);
  const next = n === 13 ? { file:'index.html', title:'Kembali ke Beranda' } : CH.find(c => c.n === n + 1);
  const prevAccent = prev.color || '#006195';
  const nextAccent = next.color || '#006195';
  return `<nav aria-label="Navigasi antar bagian" style="max-width:960px; margin:0 auto; padding:8px 24px 4px 24px;">
    <div class="chapter-nav" style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
      ${navCard(prev, 'prev', prevAccent)}
      ${navCard(next, 'next', nextAccent)}
    </div>
  </nav>`;
}

function renderGrid() {
  return CH.map(c => `<a href="${c.file}" style="display:block; text-decoration:none; border:1px solid #E1E7ED; border-radius:14px; padding:18px; border-top:4px solid ${c.color};">
        <p style="font-family:'Poppins',sans-serif; font-weight:800; font-size:20px; color:${c.color}; margin:0 0 8px 0;">${c.roman}</p>
        <p style="font-family:'Poppins',sans-serif; font-weight:700; font-size:14px; color:#1E2A32; margin:0 0 5px 0;">${c.title}</p>
        <p style="font-size:11.5px; color:#6B7683; line-height:1.55; margin:0;">${c.desc}</p>
      </a>`).join('\n      ');
}

/* ---------- transform one page ---------- */
function extractBody(raw) {
  const m = raw.match(/<x-dc>([\s\S]*?)<\/x-dc>/i);
  let body = m ? m[1] : raw;
  body = body.replace(/<helmet>[\s\S]*?<\/helmet>/i, '');       // drop design-tool head
  return body.trim();
}

function rewriteLinks(html) {
  for (const [from, to] of Object.entries(FILEMAP)) {
    html = html.split(from).join(to);
  }
  // PDF placeholder -> real file
  html = html.split('Panduan Kurikulum-print-68m1xf.dc.html').join(PDF);
  // photos png -> jpg
  for (const name of JPEG_ASSETS) html = html.split(`assets/${name}.png`).join(`assets/${name}.jpg`);
  // lazy-load + async decode on all images
  html = html.replace(/<img /g, '<img loading="lazy" decoding="async" ');
  return html;
}

/* Auto-linkify bare URLs / domains / emails in visible text.
   Skips anything already inside <a>, <script>, or <style>, and never
   touches tag attributes (only text between tags is processed). */
const URL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|((?:https?:\/\/|www\.)[^\s<]+)|([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:sch\.id|co\.id|ac\.id|go\.id|or\.id|id|com|net|org|edu|io|app)(?:\/[^\s<]*)?)/g;
const LINK_STYLE = 'color:#006195; text-decoration:underline; text-underline-offset:2px;';

function linkifyText(text) {
  return text.replace(URL_RE, (full, email, url, domain) => {
    if (email) return `<a href="mailto:${email}" style="${LINK_STYLE}">${email}</a>`;
    let token = url || domain;
    let trail = '';
    const tm = token.match(/[).,;:!?\]}'"»]+$/);           // keep trailing punctuation outside the link
    if (tm) { trail = tm[0]; token = token.slice(0, -trail.length); }
    const href = /^https?:\/\//i.test(token) ? token : 'https://' + token;
    return `<a href="${href}" target="_blank" rel="noopener" style="${LINK_STYLE}">${token}</a>${trail}`;
  });
}

function linkify(html) {
  const skipOpen = /^<(a|script|style)\b/i;
  const skipClose = /^<\/(a|script|style)\s*>/i;
  let depth = 0;
  return html.split(/(<[^>]+>)/g).map(tok => {
    if (tok.startsWith('<')) {
      if (skipClose.test(tok)) depth = Math.max(0, depth - 1);
      else if (skipOpen.test(tok) && !/\/>$/.test(tok)) depth++;
      return tok;
    }
    return depth > 0 ? tok : linkifyText(tok);
  }).join('');
}

function shell({ title, desc, body, canonical, ogImage }) {
  const fullTitle = title === 'Beranda'
    ? 'Kurikulum Unggul & Berakhlak — Al Akhyar Islamic School'
    : `${title} — Kurikulum Unggul & Berakhlak | Al Akhyar`;
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#006195">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kurikulum Unggul & Berakhlak — Al Akhyar Islamic School">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE_URL}/assets/${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap">
<link rel="stylesheet" href="styles.css">
</head>
<body>
${body}
</body>
</html>`;
}

/* ---------- run ---------- */
const pagesDir = join(SRC, 'pages');
let count = 0;
for (const fname of readdirSync(pagesDir)) {
  if (!fname.endsWith('.dc.html')) continue;
  const raw = readFileSync(join(pagesDir, fname), 'utf8');
  let body = extractBody(raw);

  const isHome = fname.includes('beranda');
  const active = isHome ? 0 : (fname.match(/bab-(\d+)/) ? Number(fname.match(/bab-(\d+)/)[1]) : 0);

  // expand homepage chapter grid loop
  body = body.replace(/<sc-for[\s\S]*?<\/sc-for>/i, isHome ? renderGrid() : '');
  // swap component imports
  body = body.replace(/<dc-import name="KurikulumWebNav"[^>]*><\/dc-import>/i, () => renderNav(active));
  const beforeFooter = (!isHome && active >= 1 && active <= 13) ? renderChapterNav(active) + '\n' : '';
  body = body.replace(/<dc-import name="KurikulumWebFooter"[^>]*><\/dc-import>/i, () => beforeFooter + renderFooter());

  body = rewriteLinks(body);
  body = linkify(body);

  const out = FILEMAP[fname];
  const meta = isHome
    ? { title:'Beranda', desc:'Panduan Kurikulum Unggul & Berakhlak Al Akhyar Islamic School — integrasi Kurikulum Merdeka dengan kekhasan keislaman untuk KB, TK, SD, SMP, dan SMA. Tahun Ajaran 2026/2027.', ogImage:'cover.jpg' }
    : (() => { const c = CH.find(x => x.file === out); return { title:c.title, desc:c.desc, ogImage:'cover.jpg' }; })();

  const canonical = `${SITE_URL}/${out === 'index.html' ? '' : out}`;
  const html = shell({ ...meta, body, canonical });
  writeFileSync(join(DIST, out), html);
  count++;
}

/* sitemap.xml */
const urls = ['index.html', ...CH.map(c => c.file)];
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}/${u === 'index.html' ? '' : u}</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>${u === 'index.html' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);

/* robots.txt */
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

/* 404 page */
const notFound = shell({
  title: 'Halaman Tidak Ditemukan', desc: 'Halaman yang Anda cari tidak ditemukan.', ogImage: 'cover.jpg',
  canonical: `${SITE_URL}/404.html`,
  body: `${renderNav(0)}
<div style="font-family:'Plus Jakarta Sans',sans-serif; max-width:640px; margin:0 auto; padding:80px 24px; text-align:center;">
  <p style="font-family:'Poppins',sans-serif; font-weight:800; font-size:64px; color:#006195; margin:0;">404</p>
  <h1 style="font-family:'Poppins',sans-serif; font-weight:800; font-size:24px; color:#1E2A32; margin:8px 0 12px 0;">Halaman tidak ditemukan</h1>
  <p style="font-size:14px; line-height:1.7; color:#6B7683; margin:0 0 24px 0;">Maaf, halaman yang Anda cari tidak tersedia. Silakan kembali ke beranda untuk menelusuri panduan kurikulum.</p>
  <a href="index.html" style="display:inline-block; background:#006195; color:#fff; text-decoration:none; font-weight:700; font-size:13.5px; padding:13px 26px; border-radius:10px;">← Kembali ke Beranda</a>
</div>
${renderFooter()}`,
});
writeFileSync(join(DIST, '404.html'), notFound);

console.log(`Built ${count} pages + sitemap, robots, 404 -> dist/`);
