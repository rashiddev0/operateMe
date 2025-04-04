# VPS Deployment Guide

This guide provides detailed instructions for deploying the OperateMe system on a VPS server.

## Prerequisites
- Ubuntu 22.04 LTS or similar Linux distribution
- Root or sudo access
- Domain name pointed to your server
- Basic command line knowledge

## Step 1: Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required system dependencies
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -y pm2 -g
```

## Step 2: PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE operateme;"
sudo -u postgres psql -c "CREATE USER operateuser WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE operateme TO operateuser;"
```

## Step 3: Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/operateme
sudo chown $USER:$USER /var/www/operateme

# Clone repository
git clone https://github.com/yourusername/operateme.git /var/www/operateme
cd /var/www/operateme

# Install dependencies
npm install

# Build the application
npm run build
```

## Step 4: Environment Configuration

Create and edit the .env file:
```env
DATABASE_URL=postgresql://operateuser:your_secure_password@localhost:5432/operateme
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret
```

## Step 5: Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/operateme/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    client_max_body_size 50M;
}
```

## Step 6: SSL Setup

```bash
# Install SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Step 7: Process Management

```bash
# Start the application with PM2
pm2 start server/index.ts --name "operateme" --interpreter="node_modules/.bin/tsx"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
sudo pm2 startup
```

## Maintenance

### Backups
```bash
# Database backup
pg_dump -U operateuser operateme > backup.sql

# Files backup
tar -czf uploads_backup.tar.gz uploads/
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart application
pm2 restart operateme
```

### Monitoring
```bash
# View logs
pm2 logs operateme

# Monitor application
pm2 monit
```

## Security Considerations

1. Firewall Setup:
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

2. Regular Updates:
```bash
# Create update script
sudo nano /usr/local/bin/update-system.sh

# Add content:
#!/bin/bash
apt update
apt upgrade -y
npm audit fix
```

## Troubleshooting

1. Check application logs:
```bash
pm2 logs operateme
```

2. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

3. Check PostgreSQL logs:
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

For more detailed troubleshooting, refer to the [Troubleshooting Guide](troubleshooting.md).
