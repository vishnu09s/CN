# Testing Guide - Inventory Management System

## Quick Start Testing

### Prerequisites
- Node.js v16+
- MongoDB running locally or MongoDB Atlas connection string
- Postman (optional, for API testing)

### Step 1: Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/inventory-system
JWT_SECRET=dev-secret-key-12345
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
EOF

# Start backend (will listen on http://localhost:5000)
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Step 2: Frontend Setup

```bash
# Open new terminal, navigate to client
cd client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend (will open http://localhost:5173)
npm run dev
```

### Step 3: Testing Registration

1. **Navigate to** http://localhost:5173
2. **See Login page** with two tabs: "Login" and "Register"
3. **Click Register tab**
4. **Fill in the form:**
   - Email: admin@example.com
   - Username: admin123
   - Password: password123
   - Confirm Password: password123
5. **Click "Create Account"**
6. **Expected outcome**: 
   - Success toast notification
   - Redirect to dashboard
   - Should see statistics (all 0 initially)

### Step 4: Testing Login

1. **Click Logout** (top right button)
2. **Verify redirect** to login page
3. **Click Login tab**
4. **Enter credentials:**
   - Username: admin123
   - Password: password123
5. **Click "Login"**
6. **Expected outcome**: Success notification and dashboard displayed

### Step 5: Dashboard Verification

Check all these elements on the dashboard:

#### Cards Section
- [ ] 8 blue/green/purple/red cards showing 0 values
  - Total Sales
  - Total Purchases
  - Revenue
  - Outstanding
  - Amount Collected
  - Total Products
  - Inventory Value
  - Total Customers

#### Order Statistics
- [ ] 3 cards for:
  - Total Orders
  - Pending Orders
  - Delivered Orders

#### Charts Section
- [ ] 2 charts visible (empty but styled)
  - Monthly Sales Trend (line chart)
  - Monthly Purchase Trend (bar chart)

#### Tables Section
- [ ] Recent Orders table (empty)
- [ ] Outstanding Payments (no data)
- [ ] Top Selling Products (empty)
- [ ] Low Stock Alert (should show "All Stock Levels Good")

### Step 6: API Testing with Curl

```bash
# Get the token first (from localStorage in browser after login)
TOKEN="your-jwt-token-here"

# Test Overview endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/overview

# Test Order Stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/orders

# Test Monthly Sales
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/monthly-sales

# Test Low Stock
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/low-stock
```

### Step 7: UI Responsiveness Testing

1. **Desktop (1920px)**
   - All elements visible
   - 4-column card grid

2. **Tablet (768px)**
   - 2-column card grid
   - Sidebar collapses with toggle

3. **Mobile (375px)**
   - 1-column layout
   - Hamburger menu appears
   - Touch-friendly buttons

### Step 8: Authentication Validation

#### Test Invalid Credentials
1. Click Login
2. Enter wrong password
3. Should see error: "Invalid credentials"

#### Test Missing Fields
1. Leave username blank
2. Click Login
3. Should see validation error

#### Test Token Expiry (Optional)
1. Wait 7 days OR
2. Manually expire token by:
   - Deleting from localStorage
   - Refreshing page
   - Should redirect to login

## API Endpoint Testing

### Authentication Endpoints

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "token": "eyJhbGc...",
  "admin": {
    "_id": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin123",
    "password": "password123"
  }'
```

#### Change Password
```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

#### Verify Token
```bash
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/verify
```

### Dashboard Endpoints

#### Get All Dashboard Data (Recommended)
```bash
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/all
```

Returns all statistics in one request.

#### Get Overview
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/overview
```

#### Get Order Statistics
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/orders
```

#### Get Recent Orders
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/dashboard/recent-orders?limit=10"
```

#### Get Recent Transactions
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/dashboard/recent-transactions?limit=10"
```

#### Get Low Stock Products
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/low-stock
```

#### Get Outstanding Customers
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/dashboard/outstanding-customers?limit=10"
```

#### Get Monthly Sales
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/monthly-sales

# Specific year
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/dashboard/monthly-sales?year=2024"
```

#### Get Top Products
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/dashboard/top-products?limit=10"
```

## Common Issues & Solutions

### Issue: CORS Error
**Error**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**: 
- Ensure backend is running
- Check CORS_ORIGIN in server/.env matches frontend URL
- Restart backend after changing .env

### Issue: Connection Refused
**Error**: "Failed to fetch" or "connection refused"
**Solution**:
- Backend not running: `npm run dev` in server directory
- Wrong port: Check .env PORT setting
- Check ports: `lsof -i :5000` (backend) and `lsof -i :5173` (frontend)

### Issue: MongoDB Connection Error
**Error**: "Error connecting to MongoDB"
**Solution**:
- Start MongoDB: `mongod` (if local)
- Check connection string in .env
- Verify MongoDB Atlas credentials if using cloud
- Ensure firewall allows MongoDB connections

### Issue: Token Expired
**Error**: "Token is not valid"
**Solution**:
- Login again to get new token
- Clear localStorage and refresh
- Check JWT_EXPIRE setting

### Issue: Registration Fails with "Admin already exists"
**Error**: "Admin already exists. Registration is disabled."
**Solution**:
- Second admin creation is prevented by design
- Use login instead
- Or reset database if needed

## Browser DevTools Testing

### Console Testing
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Check for errors/warnings
4. All API calls should complete without errors

### Network Tab Testing
1. Open Network tab
2. Perform login/registration
3. Check response status codes:
   - 200/201 = Success
   - 400 = Bad Request
   - 401 = Unauthorized
   - 500 = Server Error

### Application Tab Testing
1. Open Application tab
2. Check localStorage
3. Should see `authToken` and `adminData`
4. After logout, both should be removed

## Performance Testing

### Load Time
1. Open DevTools Network tab
2. Reload dashboard
3. Check:
   - Page load time: < 3 seconds
   - API response: < 500ms
   - Total size: < 2MB

### Memory Usage
1. Open Chrome DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Should be < 50MB

## Load Testing (Optional)

Use Apache Bench or similar:

```bash
# Test login endpoint
ab -n 100 -c 10 -p data.json \
  http://localhost:5000/api/auth/login

# Test dashboard endpoint
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/all
```

## Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and loads
- [ ] Can register new admin account
- [ ] Can login with credentials
- [ ] Can logout
- [ ] Dashboard loads all components
- [ ] Charts display (even if empty)
- [ ] Recent orders table visible
- [ ] Alert components show
- [ ] Responsive design works
- [ ] All API endpoints respond correctly
- [ ] Token authentication works
- [ ] Error messages display properly
- [ ] No console errors

## Debugging Tips

### Enable Backend Logging
Add to server.js:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Check Token Payload
```javascript
// In browser console
JSON.parse(atob(localStorage.getItem('authToken').split('.')[1]))
```

### Clear All Data
```bash
# MongoDB - drop database
mongo inventory-system
db.dropDatabase()
```

## Next Steps After Testing

Once all tests pass:

1. ✅ Proceed to Stage 3: Inventory & Purchase Management
2. Create products
3. Add supplier information
4. Record purchases
5. Create orders to populate dashboard

## Support

For issues:
1. Check error messages in console
2. Review logs in terminal
3. Verify .env configurations
4. Check MongoDB connection
5. Restart both services if needed

---

**Testing Status**: Ready for validation
**Last Updated**: November 5, 2026
