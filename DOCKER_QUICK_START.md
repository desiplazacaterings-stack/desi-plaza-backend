# Docker Deployment - Quick Start Guide

## 📦 Files Created

1. **Dockerfile.backend** - Node.js container for backend API
2. **Dockerfile.frontend** - Multi-stage build for React/Nginx
3. **docker-compose.yml** - Orchestrates all services (MongoDB, Backend, Frontend)
4. **nginx.conf** - Nginx configuration for frontend proxy
5. **.dockerignore** - Optimizes build size
6. **.env.docker.example** - Environment template
7. **DOCKER_DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
8. **deploy.sh** - Automated deployment script

---

## 🚀 Quick Deployment Steps

### Option 1: Using Hostinger Docker Manager (Recommended)

1. **Log into Hostinger Control Panel**
   - Go to Hosting → Docker Manager
   - Click "Compose"

2. **Create Deployment**
   - Click "Compose" button
   - Copy content from `docker-compose.yml`
   - Paste into Docker Manager UI
   - Or upload via "Import from repository"

3. **Configure Environment**
   - Add environment variables in Docker Manager:
     ```
     MONGO_USER=admin
     MONGO_PASSWORD=your_secure_password
     JWT_SECRET=your_strong_secret_key
     API_BASE_URL=https://your-domain.com
     VITE_API_BASE_URL=https://your-domain.com
     ```

4. **Deploy**
   - Click "Compose"
   - Monitor logs for errors

---

### Option 2: Manual SSH Deployment

```bash
# 1. Connect to VPS
ssh root@your_vps_ip

# 2. Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sh

# 3. Clone your project or upload files
cd /home
git clone https://github.com/your-username/desi-plaza.git
cd desi-plaza

# 4. Create environment file
cp .env.docker.example .env
nano .env  # Edit with your values

# 5. Deploy
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Hostinger VPS                       │
├─────────────────────────────────────────────────────┤
│                   Docker Network                     │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Frontend  │  │ Backend  │  │   MongoDB        │ │
│  │ (Nginx+    │  │(Node.js/ │  │   (Database)     │ │
│  │  React)    │  │ Express) │  │                  │ │
│  │  Port 80   │  │ Port3000 │  │  Port 27017      │ │
│  │   443      │  │          │  │  (internal only) │ │
│  └────────────┘  └──────────┘  └──────────────────┘ │
│       ↓                ↑                             │
│    HTTP/HTTPS    REST API                          │
└─────────────────────────────────────────────────────┘
         ↓
    Your Domain
  (your-domain.com)
```

---

## 🔧 Services Overview

| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| Frontend | 80, 443 | Web App (React) | Public |
| Backend | 3000 | REST API | Internal |
| MongoDB | 27017 | Database | Internal |

---

## 📊 Environment Variables

Required variables in `.env`:

```env
# Database
MONGO_USER=admin
MONGO_PASSWORD=strong_password_here

# Security
JWT_SECRET=generate_strong_32_char_string

# URLs (change to your domain)
API_BASE_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com
```

**Generate strong secrets:**
```bash
openssl rand -hex 32
```

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Test frontend loads at your domain
- [ ] Test backend API connectivity
- [ ] Test login functionality
- [ ] Setup SSL certificate (HTTPS)
- [ ] Configure DNS records
- [ ] Enable MongoDB backups
- [ ] Monitor logs for errors
- [ ] Test all core features:
  - [ ] Create Enquiry
  - [ ] Create Quotation with Labour Charges
  - [ ] Print Quotation
  - [ ] Create Instant Order
  - [ ] Admin Dashboard access

---

## 🔍 Monitoring Commands

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Check running containers
docker-compose ps

# View resource usage
docker stats

# SSH into container
docker-compose exec backend /bin/sh
```

---

## 🛠️ Maintenance

### Update Application
```bash
cd /path/to/project
git pull origin main
docker-compose up -d --build
```

### Backup Database
```bash
docker-compose exec mongodb mongodump \
  -u admin -p password \
  --authenticationDatabase admin \
  -o /backup/$(date +%Y%m%d)
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

---

## 🔐 Security Best Practices

✅ **Already Implemented:**
- Non-root user in containers
- Health checks enabled
- Network isolation
- Security headers in Nginx
- Input validation on backend
- JWT authentication

📋 **To Configure:**
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set strong MongoDB password
- [ ] Set strong JWT secret
- [ ] Enable automated backups
- [ ] Monitor logs regularly
- [ ] Keep containers updated

---

## 📞 Troubleshooting

### Containers won't start
```bash
docker-compose logs
# Check for port conflicts or insufficient resources
```

### Frontend not loading
- Check if Nginx is running: `docker-compose ps`
- Check logs: `docker-compose logs frontend`
- Verify API_BASE_URL in .env

### API connection issues
- Check backend logs: `docker-compose logs backend`
- Verify MongoDB is healthy: `docker-compose ps mongodb`
- Check network: `docker network ls`

### Database errors
- Verify MONGO_USER and MONGO_PASSWORD match
- Check MongoDB logs: `docker-compose logs mongodb`
- Test connection manually

---

## 📚 Additional Resources

- Docker Documentation: https://docs.docker.com
- Docker Compose Guide: https://docs.docker.com/compose
- Hostinger Control Panel: https://hpanel.hostinger.com
- MongoDB Docker: https://hub.docker.com/_/mongo
- Nginx Configuration: https://nginx.org/en/docs

---

## 🆘 Need Help?

1. **Check DOCKER_DEPLOYMENT_GUIDE.md** for detailed steps
2. **Review container logs** with `docker-compose logs`
3. **Verify environment variables** with `docker-compose config`
4. **Test individual services** with curl commands
5. **Contact Hostinger support** for VPS/infrastructure issues

---

**Ready to deploy? Start with:**
```bash
./deploy.sh
```

Or manually with:
```bash
docker-compose up -d --build
```

Good luck! 🚀
