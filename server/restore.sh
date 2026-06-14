#!/bin/bash
# Khôi phục database từ file backup
# Usage: bash restore.sh backups/ketoananpha_20260613_120000.sql

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Cần chỉ định file backup."
  echo "Usage: bash restore.sh backups/ketoananpha_YYYYMMDD_HHMMSS.sql"
  echo ""
  echo "📁 Các backup hiện có:"
  ls -lt "$(dirname "$0")/backups/"*.sql 2>/dev/null | head -10
  exit 1
fi

echo "⚠️  Sẽ khôi phục từ: $BACKUP_FILE"
read -p "Tiếp tục? (y/N) " confirm
if [ "$confirm" != "y" ]; then echo "Hủy."; exit 0; fi

echo "🔄 Restoring..."
psql -U jaycao ketoananpha < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Khôi phục thành công!"
else
  echo "❌ Khôi phục thất bại!"
  exit 1
fi
