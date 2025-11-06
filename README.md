
# Guinness Rewards API (Pro)

Node.js + Express + TypeScript + MongoDB backend for the Guinness Rewards Campaign.

## Features
- Auth (JWT), Users
- Purchases (receipt/QR) + Points Engine (rules-driven)
- Partners
- Admin endpoints (approve purchases, listings)
- QR codes issue/redeem
- S3 pre-signed upload for receipts
- Swagger docs at `/docs`
- Docker + docker-compose (Mongo)
- Jest tests + GitHub Actions CI

## Quickstart
```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
# open http://localhost:4000/docs
```
