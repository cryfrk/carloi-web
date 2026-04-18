# Carloi Web

Next.js App Router tabanlı Carloi web istemcisi.

## Geliştirme

```bash
cd carloi-web
npm install
npm run dev
```

## Gerekli env

`.env.local` veya deployment env içine:

```bash
NEXT_PUBLIC_API_BASE_URL=https://carloi-api-76975332760.europe-west3.run.app
NEXT_PUBLIC_SHARE_BASE_URL=https://carloi.com
NEXT_PUBLIC_APP_NAME=Carloi
```

## Build

```bash
npm run build
npm run start
```

## Docker

```bash
docker build -t carloi-web .
docker run -p 8080:8080 --env-file .env.local carloi-web
```

## Üretim önerisi

- Web istemciyi ayrı Cloud Run servisi olarak yayınlayın.
- Aynı backend API'ye `NEXT_PUBLIC_API_BASE_URL` üzerinden bağlayın.
- Public linkler için alan adı olarak `NEXT_PUBLIC_SHARE_BASE_URL` kullanın.
