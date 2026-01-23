# VPS Deployment - Simple Steps

## Prerequisites
Your code is committed locally (commit: b700c36). Follow these steps on your VPS:

---

## Step 1: Navigate to Project Directory
```bash
# Find it first
find / -name "docker-compose.yml" -path "*/desi*" 2>/dev/null | head -1 | xargs dirname

# Then cd into it
cd /path/to/desi-plaza-caterings
```

---

## Step 2: Check Current Git Status
```bash
pwd
git status
git log --oneline -5
```

---

## Step 3: Pull Latest Code from Local Git
Since GitHub repo access is failing, you need to push to GitHub manually first, OR use a workaround:

### Option A: Manual Git - Add all files locally
```bash
cd /path/to/desi-plaza-caterings

# Add the updated docker-compose.yml we created
git add docker-compose.yml Dockerfile.frontend deploy.sh

# Commit
git commit -m "Deploy: Updated docker-compose and deployment scripts"

# Try to push (if GitHub access works)
git push origin master
```

### Option B: Direct Deployment (Recommended for Now)
Since the code is already in the container, just rebuild:

```bash
cd /path/to/desi-plaza-caterings

# Ensure docker-compose.yml is correct
cat docker-compose.yml | head -30

# Rebuild frontend with no cache
docker-compose build --no-cache frontend

# Start it
docker-compose up -d frontend

# Check status
docker-compose ps
docker-compose logs -f frontend
```

---

## Step 4: Verify Deployment
```bash
# After ~30 seconds, check if it's running
docker-compose ps | grep frontend

# Test the endpoint
curl http://localhost:8080/menu

# View the web app
# Open browser: https://www.desiplazacaterings.com/menu
```

---

## What to Expect
✅ Menu shows items 1x (not 3x)  
✅ Network tab shows 1 API call (not 3)  
✅ Frontend container marked as "Up"  
✅ No errors in Docker logs  

---

## If Build Still Fails
```bash
# Check if Dockerfile.frontend exists
ls -la Dockerfile.frontend

# If missing, copy from local machine to VPS or recreate it
# Show file structure
ls -la frontend/

# Check nginx.conf exists
ls -la frontend/nginx.conf
```

---

## Quick Copy-Paste Commands for VPS
```bash
# Navigate to project
cd $(find / -name "docker-compose.yml" -path "*/desi*" 2>/dev/null | head -1 | xargs dirname)

# Rebuild and deploy
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs frontend | tail -50
```

