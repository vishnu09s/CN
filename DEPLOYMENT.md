# Deployment Guide

Complete guide for deploying the Inventory Management System to various platforms.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups created
- [ ] SSL certificates ready (for production)
- [ ] API tests passing
- [ ] Frontend builds successfully
- [ ] Security audit completed
- [ ] Error logging configured
- [ ] Monitoring setup complete

## Local Development

```bash
# Start MongoDB
mongod

# Terminal 1: Backend
cd server
npm install
npm start

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

## Docker Deployment

### Prerequisites
- Docker 20+
- Docker Compose 1.29+

### Build and Run
```bash
# Build all containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f server

# Stop services
docker-compose down
```

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account

### Setup
```bash
# Login to Heroku
heroku login

# Create app
heroku create inventory-management-app

# Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox -a inventory-management-app

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key -a inventory-management-app
heroku config:set NODE_ENV=production -a inventory-management-app

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Procfile
Create `Procfile` in root:
```
web: cd server && npm start
```

## AWS Deployment

### EC2 Setup

1. **Launch Instance**
   - OS: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (minimum)
   - Storage: 20GB gp3

2. **SSH Access**
   ```bash
   ssh -i key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MongoDB
   sudo apt install -y mongodb

   # Install Nginx
   sudo apt install -y nginx

   # Install PM2
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/vishnu09s/CN.git
   cd CN
   ```

5. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   nano .env
   ```

6. **Install Dependencies**
   ```bash
   # Backend
   cd server && npm install && cd ..

   # Frontend
   cd client && npm install && npm run build && cd ..
   ```

7. **Setup PM2**
   ```bash
   cd server
   pm2 start server.js --name "inventory-app"
   pm2 startup
   pm2 save
   cd ..
   ```

8. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

10. **Restart Services**
    ```bash
    sudo systemctl restart nginx
    sudo systemctl restart mongodb
    ```

## DigitalOcean App Platform

### Deployment
1. Connect GitHub repository
2. Select Node.js runtime
3. Configure environment variables
4. Add MongoDB component
5. Deploy

## MongoDB Atlas Setup

### Cloud Database
1. Create MongoDB Atlas account
2. Create cluster (free tier available)
3. Create database user
4. Get connection string
5. Add to `MONGODB_URI` in `.env`

```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Production Environment Variables

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_very_long_secret_key_here
PORT=5000
CORS_ORIGIN=https://your-domain.com
```

## SSL/TLS Certificate

### Self-Signed (Development)
```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Let's Encrypt (Production)
```bash
sudo certbot certonly --standalone -d your-domain.com
```

## Database Backup

### Manual Backup
```bash
mongodump --uri "mongodb://user:pass@host:27017/database" --out ./backup
```

### Automated Backup (Cron)
```bash
# Add to crontab
0 2 * * * mongodump --uri "mongodb://..." --out /backups/$(date +\%Y\%m\%d)
```

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 web                 # Open http://localhost:9615
pm2 logs                # View logs
pm2 monit              # Monitor processes
```

### Application Logging
```bash
# Create logger middleware
const fs = require('fs');
const stream = fs.createWriteStream('logs/app.log', { flags: 'a' });

app.use((req, res, next) => {
  stream.write(`${new Date()} - ${req.method} ${req.url}\n`);
  next();
});
```

## Health Checks

### Endpoint Monitoring
```bash
curl http://your-domain.com/api/health
```

### Automated Health Checks
```bash
# Use services like UptimeRobot or Pingdom
# Configure to hit /api/health every 5 minutes
```

## Performance Optimization

### Frontend
- Enable gzip compression in Nginx
- Use CDN for static assets
- Implement caching headers

### Backend
- Enable database connection pooling
- Use Redis for caching
- Implement rate limiting
- Use load balancer (nginx)

### Database
- Index frequently queried fields
- Archive old data
- Regular maintenance tasks
- Monitor slow queries

## Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx, HAProxy)
- Multiple backend instances
- Session management with Redis

### Vertical Scaling
- Upgrade server resources
- Optimize code
- Database optimization

## Troubleshooting

### Connection Issues
```bash
# Check if services are running
systemctl status mongodb
systemctl status nginx
pm2 list

# Check ports
netstat -tulpn | grep LISTEN
```

### Performance Issues
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU
top
```

### Database Issues
```bash
# Connect to MongoDB
mongosh

# Check logs
tail -f /var/log/mongodb/mongod.log
```

## Post-Deployment

1. **Verify Deployment**
   - Test all API endpoints
   - Test frontend functionality
   - Verify database connectivity

2. **Configure Monitoring**
   - Setup error tracking (Sentry)
   - Setup performance monitoring
   - Setup uptime monitoring

3. **Backup Strategy**
   - Schedule daily backups
   - Test restore procedures
   - Document recovery process

4. **Security Hardening**
   - Disable unnecessary services
   - Configure firewall
   - Update SSL certificates
   - Enable 2FA on accounts

5. **Documentation**
   - Document deployment process
   - Create runbooks for common tasks
   - Document incident procedures

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version
git revert <commit-hash>
git push
pm2 restart inventory-app
```

## Support

For deployment issues, refer to documentation or open an issue on GitHub.
