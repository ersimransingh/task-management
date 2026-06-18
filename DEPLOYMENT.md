# Deployment Guide — TaskMaster

Deploy TaskMaster on an Ubuntu/Debian server using **PM2** + **Nginx** + **Certbot**.

## Server prerequisites

- Node.js 20+ and npm
- PM2 installed globally: `npm i -g pm2`
- Nginx installed: `sudo apt install nginx`
- Certbot installed: `sudo apt install certbot python3-certbot-nginx`

## 1. Clone / upload the project

Place the project on the server, for example:

```bash
cd /var/www
git clone <your-repo-url> task-management
cd task-management
```

## 2. Install dependencies and build

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

## 3. Environment variables

Create `/var/www/task-management/.env`:

```env
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="<strong-random-secret>"
PORT=3013
```

Make sure `DATABASE_URL` points to a persistent path. The repo contains `prisma/dev.db`, so `file:./prisma/dev.db` works if you run the app from the project root.

## 4. PM2 setup

The repo includes `ecosystem.config.js`. Create the logs folder and start the app:

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

The app will run on port **3013**.

Useful PM2 commands:

```bash
pm2 status
pm2 logs task-management
pm2 restart task-management
pm2 stop task-management
```

## 5. Nginx config

Copy the provided config to Nginx:

```bash
sudo cp deployment/nginx/tm.qxoo.in.conf /etc/nginx/conf.d/tm.qxoo.in.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL certificate with Certbot

Since Certbot is already installed, run:

```bash
sudo certbot --nginx -d tm.qxoo.in
```

Follow the prompts. Certbot will update the Nginx config with the correct certificate paths and set up auto-renewal.

Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

## 7. Firewall (optional but recommended)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 8. Verify

Open `https://tm.qxoo.in` in a browser.

## Updating the app after changes

On the server:

```bash
cd /var/www/task-management
git pull
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart task-management
```

## Notes

- This is a **Node.js server** deployment (`next start`), not a static export.
- SQLite is fine for small single-server deployments. For high availability, switch to PostgreSQL and update `DATABASE_URL`.
- Uploaded files are stored in `public/uploads/`; make sure this folder is writable by the user running PM2.
