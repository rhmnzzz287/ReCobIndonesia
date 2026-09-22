#!/usr/bin/env bash
# push-ke-github.sh
#
# Mengirim seluruh riwayat ke github.com/rhmnzzz287/ReCobIndonesia.
#
# Prasyarat: autentikasi GitHub sudah siap di mesin ini, salah satu dari:
#   a) gh auth login -h github.com   (dipilih: HTTPS)
#   b) kunci SSH yang sudah ditambahkan di github.com/settings/keys
#
# Skrip memverifikasi lebih dulu dan berhenti bila autentikasi belum siap.

set -euo pipefail

REPO="/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
REMOTE_HTTPS="https://github.com/rhmnzzz287/ReCobIndonesia.git"
REMOTE_SSH="git@github.com:rhmnzzz287/ReCobIndonesia.git"

cd "$REPO"

echo "=== 1. Keadaan repo ==="
if [ -n "$(git status --porcelain)" ]; then
  echo "GAGAL: working tree tidak bersih. Commit dulu sebelum push." >&2
  git status --short >&2
  exit 1
fi
echo "  working tree bersih"
echo "  branch : $(git branch --show-current)"
echo "  commit : $(git log --oneline | wc -l)"
echo "  berkas : $(git ls-files | wc -l)"

echo
echo "=== 2. Memilih jalur autentikasi ==="
if gh auth status >/dev/null 2>&1; then
  echo "  gh: terautentikasi"
  git remote set-url origin "$REMOTE_HTTPS"
  # gh sebagai credential helper agar HTTPS memakai token gh.
  gh auth setup-git
elif ssh -o BatchMode=yes -o ConnectTimeout=10 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  echo "  ssh: terautentikasi"
  git remote set-url origin "$REMOTE_SSH"
else
  echo "GAGAL: tidak ada jalur autentikasi yang siap." >&2
  echo "Jalankan salah satu lebih dulu:" >&2
  echo "  gh auth login -h github.com" >&2
  echo "  atau tambahkan kunci SSH di github.com/settings/keys" >&2
  exit 1
fi

echo
echo "=== 3. Remote tujuan ==="
git remote -v

echo
echo "=== 4. Mengirim ==="
# Branch utama dipastikan bernama main di sisi remote.
git push --set-upstream origin main

echo
echo "=== 5. Verifikasi ==="
git ls-remote --heads origin | head -5
echo
echo "  commit lokal  : $(git rev-parse HEAD)"
echo "  commit remote : $(git ls-remote origin refs/heads/main | cut -f1)"
echo
echo "Selesai. Repo: https://github.com/rhmnzzz287/ReCobIndonesia"
