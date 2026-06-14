#!/bin/bash
# Thêm bảng/cột mới vào database MÀ KHÔNG XÓA dữ liệu cũ
# Dùng lệnh này thay vì `prisma db push --force-reset`
# Usage: bash migrate.sh

cd "$(dirname "$0")"
echo "🔄 Syncing schema to database (data-safe)..."
npx prisma db push
echo "✅ Done. Dữ liệu cũ được giữ nguyên."
