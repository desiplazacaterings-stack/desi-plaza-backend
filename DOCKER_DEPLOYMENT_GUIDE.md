# Docker Deployment Guide - Desi Plaza Caterings

## Prerequisites
- Docker and Docker Compose installed on VPS
- Git repository access
- Domain name (for SSL)
- SSH access to VPS

---

## Step 1: Prepare Your VPS

### 1.1 Connect to VPS
```bash
ssh root@your_vps_ip
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 1.4 Install Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## Step 2: Deploy Using Hostinger Docker Manager

### 2.1 Through Hostinger Control Panel:
1. Go to **Hosting** → **Docker Manager**
2. Click **"Compose"** button
3. Select **"Import from repository URL"**
4. Enter your GitHub repository URL
5. Or manually paste the `docker-compose.yml` content

### 2.2 Alternative - Manual Deployment via SSH:

```bash
# Create project directory
mkdir -p /home/desi-plaza
cd /home/desi-plaza

# Clone repository (or upload files)
git clone https://github.com/your-username/desi-plaza.git .

# Or upload files via SCP
scp -r ./Dockerfile.* root@your_vps_ip:/home/desi-plaza/
scp -r ./docker-compose.yml root@your_vps_ip:/home/desi-plaza/
scp -r ./nginx.conf root@your_vps_ip:/home/desi-plaza/
scp -r ./backend root@your_vps_ip:/home/desi-plaza/
scp -r ./frontend root@your_vps_ip:/home/desi-plaza/
```

---

## Step 3: Configure Environment

### 3.1 Create .env file
```bash
cd /home/desi-plaza
cp .env.docker.example .env
nano .env
```

### 3.2 Update .env with your values
```env
# MongoDB Configuration - CHANGE THESE!
MONGO_USER=admin
MONGO_PASSWORD=your_very_secure_password_123456789

# JWT Secret - Generate a strong one
JWT_SECRET=generate_a_random_string_here_min_32_chars

# Domain
API_BASE_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com
```

**Generate strong JWT Secret:**
```bash
openssl rand -hex 32
```

---

## Step 4: Start Docker Containers

### 4.1 Build and Start Services
```bash
docker-compose up -d --build
```

### 4.2 Verify All Containers Are Running
```bash
docker-compose ps
```

Expected output:
```
NAME                         STATUS
desi-plaza-mongodb           Up (healthy)
desi-plaza-backend           Up (healthy)
desi-plaza-frontend          Up
```

### 4.3 Check Logs
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

---

## Step 5: Setup SSL Certificate (HTTPS)

### 5.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL Certificate
```bash
certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

### 5.3 Create nginx SSL Config
```bash
mkdir -p /home/desi-plaza/ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /home/desi-plaza/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /home/desi-plaza/ssl/
```

### 5.4 Update nginx.conf for HTTPS
Add to `nginx.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # Rest of config...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Step 6: Setup DNS (Through Hostinger)

1. Go to **Domains** → **Your Domain** → **DNS**
2. Add records:
   ```
   A Record: @ → Your VPS IP
   A Record: www → Your VPS IP
   ```
3. Or use CNAME if provided

Wait 5-30 minutes for DNS propagation.

---

## Step 7: Verify Deployment

### 7.1 Test Backend API
```bash
curl http://localhost:3000/api/health
```

### 7.2 Test Frontend
- Open browser: `http://your-domain.com`

### 7.3 Check MongoDB Connection
```bash
docker-compose exec mongodb mongosh -u admin -p your_password admin
```

---

## Maintenance Commands

### Monitor Logs
```bash
docker-compose logs -f

# Watch specific container
docker-compose logs -f backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Update Application
```bash
cd /home/desi-plaza
git pull origin main  # or upload new files
docker-compose up -d --build
```

### Backup MongoDB Data
```bash
docker-compose exec mongodb mongodump \
  -u admin -p your_password \
  --authenticationDatabase admin \
  -o /data/db/backup/$(date +%Y%m%d)
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Data (CAUTION!)
```bash
docker-compose down -v  # Removes volumes/data!
```

---

## Troubleshooting

### 1. Containers not starting
```bash
docker-compose logs
# Check for port conflicts or permission issues
```

### 2. MongoDB connection failed
```bash
# Verify connection string in logs
docker-compose logs backend | grep "MongoDB"
```

### 3. Frontend not connecting to API
- Check `VITE_API_BASE_URL` in .env
- Verify backend is healthy: `docker-compose ps`
- Check nginx logs: `docker-compose logs frontend`

### 4. Out of memory
```bash
# Check usage
docker system df

# Clean up unused images
docker image prune -a
```

### 5. Permission denied errors
```bash
# Add docker group to user
usermod -aG docker $USER
newgrp docker
```

---

## Production Checklist

- ✅ Update MongoDB password in .env
- ✅ Generate strong JWT secret
- ✅ Setup SSL certificate
- ✅ Configure domain DNS
- ✅ Enable automatic MongoDB backups
- ✅ Setup monitoring/alerts
- ✅ Review security group/firewall rules
- ✅ Test login and core features
- ✅ Setup email notifications
- ✅ Document backup procedures

---

## Important Security Notes

⚠️ **NEVER commit .env file to git**

Add to `.gitignore`:
```
.env
.env.local
.env.*.local
docker-compose.override.yml
```

---

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables: `docker-compose config`
3. Check Hostinger Docker Manager UI
4. Review Docker documentation: https://docs.docker.com

---

**Deployment Date**: January 20, 2026
**Project**: Desi Plaza Caterings
**Stack**: Node.js + React + MongoDB + Nginx
