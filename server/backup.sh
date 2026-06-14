#!/bin/bash
# Backup database PostgreSQL
# Usage: bash backup.sh
# Nên chạy định kỳ hoặc trước khi thay đổi schema

BACKUP_DIR="$(dirname "$0")/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/ketoananpha_$DATE.sql"

mkdir -p "$BACKUP_DIR"

echo "💾 Backing up database..."
pg_dump -U jaycao ketoananpha > "$FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup saved: $FILE"
  # Giữ lại 10 file backup gần nhất
  ls -t "$BACKUP_DIR"/*.sql | tail -n +11 | xargs rm -f 2>/dev/null
  echo "📁 Total backups: $(ls "$BACKUP_DIR"/*.sql | wc -l)"
else
  echo "❌ Backup failed!"
  exit 1
fi
