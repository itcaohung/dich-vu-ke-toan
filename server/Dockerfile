FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --include=dev

RUN npx prisma generate

COPY . .

RUN npm run build

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD npx prisma migrate resolve --rolled-back "20260620000000_init" 2>/dev/null; npx prisma migrate deploy && node dist/index.js
