#!/usr/bin/env bash
# ============================================================
# Deploy Kurikulum Unggul & Berakhlak ke web root CloudPanel.
# Menarik versi terbaru dari git lalu menyalin dist/ ke htdocs.
# Jalankan di SERVER sebagai site user CloudPanel:
#   ~/kurikulum-alakhyar/scripts/deploy.sh
# ============================================================
set -euo pipefail

# Lokasi clone repo (bukan di dalam htdocs) dan web root situs.
REPO_DIR="${REPO_DIR:-$HOME/kurikulum-alakhyar}"
WEBROOT="${WEBROOT:-$HOME/htdocs/kurikulum.alakhyar.sch.id}"

cd "$REPO_DIR"
echo "→ git pull di $REPO_DIR"
git pull --ff-only

# (Opsional) build ulang bila Anda mengubah src/ dan Node tersedia.
# dist/ sudah di-commit, jadi baris ini boleh tetap dinonaktifkan.
# command -v node >/dev/null 2>&1 && node build.mjs

echo "→ sinkronkan dist/ ke $WEBROOT"
mkdir -p "$WEBROOT"
# --delete membersihkan file lama; .well-known dikecualikan agar
# perpanjangan sertifikat Let's Encrypt tidak terganggu.
rsync -a --delete --exclude '.well-known/' dist/ "$WEBROOT/"

echo "✓ Deploy selesai: $(date '+%Y-%m-%d %H:%M:%S')"
