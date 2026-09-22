#!/usr/bin/env bash
# selesai-migrasi.sh
#
# Menghapus folder proyek lama di drive Windows setelah migrasi ke drive Linux.
#
# Jalankan di SESI BARU (bukan sesi yang sedang berjalan di folder lama), setelah:
#   1. Dolphin ditutup
#   2. Zed ditutup (termasuk language server-nya)
#   3. Hermes dijalankan dari folder baru ini
#
# Skrip menolak berjalan bila verifikasi keselamatan gagal.

set -euo pipefail

LAMA="/run/media/sh1shiroon/Kerjaan Windows #1/ReCobID"
BARU="/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
COMMIT_DIHARAPKAN="8ec7d407d9fd69778c2cd1addec2dd249a09514e"

echo "=== 1. Verifikasi folder baru utuh ==="
if [ ! -d "$BARU/.git" ]; then
  echo "GAGAL: $BARU bukan repositori git. Berhenti." >&2
  exit 1
fi

HEAD_BARU="$(git -C "$BARU" rev-parse HEAD)"
if [ "$HEAD_BARU" != "$COMMIT_DIHARAPKAN" ]; then
  echo "GAGAL: HEAD folder baru $HEAD_BARU, diharapkan $COMMIT_DIHARAPKAN. Berhenti." >&2
  exit 1
fi
echo "  folder baru OK: HEAD $HEAD_BARU"

echo
echo "=== 2. Verifikasi folder lama tidak memuat berkas unik ==="
if [ -d "$LAMA" ]; then
  HANYA_LAMA="$(cd "$LAMA" && find . -type f \
    -not -path './node_modules/*' -not -path './.git/*' -not -path './.next/*' \
    -not -path './apps/web/node_modules/*' -not -path './apps/web/.next/*' \
    | sort | while read -r f; do
        [ -f "$BARU/$f" ] || echo "$f"
      done)"
  if [ -n "$HANYA_LAMA" ]; then
    echo "GAGAL: berkas berikut hanya ada di folder lama:" >&2
    echo "$HANYA_LAMA" >&2
    echo "Salin dulu sebelum menghapus. Berhenti." >&2
    exit 1
  fi
  echo "  tidak ada berkas unik di folder lama"
else
  echo "  folder lama sudah tidak ada; tidak ada yang dikerjakan"
  exit 0
fi

echo
echo "=== 3. Verifikasi tidak ada proses yang memakai folder lama ==="
PEMAKAI="$(lsof +D "$LAMA" 2>/dev/null | tail -n +2 | awk '{print $1" (PID "$2")"}' | sort -u || true)"
if [ -n "$PEMAKAI" ]; then
  echo "GAGAL: masih ada proses yang memakai folder lama:" >&2
  echo "$PEMAKAI" >&2
  echo "Tutup proses tersebut lalu ulangi. Berhenti." >&2
  exit 1
fi
echo "  tidak ada proses yang memakai folder lama"

echo
echo "=== 4. Menghapus folder lama ==="
rm -rf "$LAMA"
echo "  dihapus: $LAMA"

echo
echo "=== 5. Hasil ==="
echo "  proyek sekarang hanya di: $BARU"
echo "  drive Windows (/dev/sdb5) kini dapat di-unmount:"
echo "    udisksctl unmount -b /dev/sdb5"
