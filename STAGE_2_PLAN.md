# Stage 2: Authentication & Dashboard Implementation

## Overview

This stage focuses on implementing complete authentication system and building a comprehensive dashboard with real-time statistics.

## Objectives

1. ✓ Implement admin authentication API
2. ✓ Create JWT token management
3. ✓ Build dashboard statistics endpoints
4. ✓ Create dashboard UI with charts
5. ✓ Implement real-time data updates

## Implementation Plan

### Phase 1: Backend Authentication (1-2 hours)

#### 1.1 Admin Registration (Initial Setup)

**File**: `server/routes/authRoutes.js`

```javascript
// POST /api/auth/register (First time only)
// Create initial admin account
// Requirements:
// - Username (min 4 chars, unique)
// - Email (valid, unique)
// - Password (min 6 chars, will be hashed)
// - Confirm password

// Response: { success: true, message: "Admin created", admin: {...}, token: "jwt" }
```

#### 1.2 Admin Login

**File**: `server/routes/authRoutes.js`

```javascript
// POST /api/auth/login
// Validate username and password
// Check against Admin collection
// Generate JWT token
// Return token and admin data

// Request: { username, password }
// Response: { success: true, token: "...", admin: {...} }
```

#### 1.3 Change Password

**File**: `server/routes/authRoutes.js`

```javascript
// POST /api/auth/change-password (Protected)
// Verify old password
// Hash new password
// Update admin record

// Request: { oldPassword, newPassword, confirmPassword }
// Response: { success: true, message: "Password updated" }
```

#### 1.4 Verify Token

**File**: `server/routes/authRoutes.js`

```javascript
// GET /api/auth/verify (Protected)
// Check if token is valid
// Return current admin data

// Response: { success: true, admin: {...} }
```

### Phase 2: Dashboard Statistics API (2-3 hours)

#### 2.1 Overview Statistics

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/overview
// Calculate and return:
// - totalSales (sum of all order amounts where paymentStatus = Fully Paid)
// - totalPurchases (sum of all purchase amounts)
// - totalRevenue (totalSales - COGS)
// - outstandingPayments (sum of pending amounts)
// - amountCollected (totalPaid from all orders)
// - totalProducts (count of products)
// - inventoryValue (sum of quantity × sellingPrice)
// - totalCustomers (count of active customers)

// Response: {
//   totalSales: 0,
//   totalPurchases: 0,
//   totalRevenue: 0,
//   outstandingPayments: 0,
//   amountCollected: 0,
//   totalProducts: 0,
//   inventoryValue: 0,
//   totalCustomers: 0
// }
```

#### 2.2 Order Overview

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/orders
// Count orders by status:
// - totalOrders
// - pendingOrders (Order Received)
// - processingOrders (Accepted, Processing)
// - readyForDispatch (Ready for Dispatch)
// - dispatchedOrders (Dispatched)
// - deliveredOrders (Delivered)
// - cancelledOrders (Cancelled)

// Response: {
//   totalOrders: 0,
//   pending: 0,
//   processing: 0,
//   readyForDispatch: 0,
//   dispatched: 0,
//   delivered: 0,
//   cancelled: 0
// }
```

#### 2.3 Recent Orders

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/recent-orders?limit=10
// Return latest 10 orders with:
// - orderId, customer details, amount, status
// - Sorted by orderDate descending

// Response: {
//   orders: [{ orderId, customerName, amount, status, orderDate }, ...]
// }
```

#### 2.4 Recent Transactions

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/recent-transactions?limit=10
// Return latest payments recorded
// - Amount, payment method, customer, date

// Response: {
//   transactions: [{ paymentId, customerName, amount, method, date }, ...]
// }
```

#### 2.5 Low Stock Products

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/low-stock
// Return products where quantity <= minimumThreshold
// - Product details with current stock

// Response: {
//   products: [{ productId, name, quantity, threshold }, ...]
// }
```

#### 2.6 Outstanding Customers

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/outstanding-customers?limit=10
// Return top 10 customers by outstanding balance
// - Customer name, phone, outstanding amount

// Response: {
//   customers: [{ customerId, name, phone, outstanding }, ...]
// }
```

#### 2.7 Monthly Sales Chart Data

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/monthly-sales
// Calculate sales for each month of current year
// - Month-wise sum of order amounts (fully paid)

// Response: {
//   data: [
//     { month: "Jan", sales: 0 },
//     { month: "Feb", sales: 0 },
//     ...
//   ]
// }
```

#### 2.8 Monthly Purchase Chart Data

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/monthly-purchases
// Calculate purchases for each month of current year
// - Month-wise sum of purchase amounts

// Response: {
//   data: [
//     { month: "Jan", purchases: 0 },
//     { month: "Feb", purchases: 0 },
//     ...
//   ]
// }
```

#### 2.9 Top Selling Products

**File**: `server/routes/dashboardRoutes.js`

```javascript
// GET /api/dashboard/top-products?limit=10
// Return top 10 products by quantity sold
// - Product details with total quantity sold

// Response: {
//   products: [{ productId, name, totalSold, revenue }, ...]
// }
```

### Phase 3: Backend Controllers (1-2 hours)

#### 3.1 Auth Controller

**File**: `server/controllers/authController.js`

```javascript
// Register admin (only once)
// Login admin with credentials
// Change password with validation
// Verify token validity
// Get current admin info
```

#### 3.2 Dashboard Controller

**File**: `server/controllers/dashboardController.js`

```javascript
// getOverview() - Business statistics
// getOrderStats() - Order breakdown
// getRecentOrders() - Latest orders
// getRecentTransactions() - Latest payments
// getLowStockProducts() - Stock alerts
// getOutstandingCustomers() - Top debtors
// getMonthlySalesData() - Sales trend
// getMonthlyPurchaseData() - Purchase trend
// getTopProducts() - Best sellers
```

#### 3.3 Helper Calculations

**File**: `server/utils/calculationHelpers.js`

```javascript
// calculateTotalSales()
// calculateTotalPurchases()
// calculateRevenue()
// calculateOutstanding()
// calculateInventoryValue()
// getOrderStatusCounts()
// getMonthlyData()
// getTopProducts()
```

### Phase 4: Frontend Authentication (2 hours)

#### 4.1 Login Implementation

**File**: `client/src/pages/LoginPage.jsx` (Update)

```javascript
// Already created, just needs:
// - Form validation
// - Error handling
// - Loading state
// - Redirect to dashboard on success
```

#### 4.2 API Functions

**File**: `client/src/api/authAPI.js`

```javascript
// login(username, password)
// logout()
// changePassword(oldPassword, newPassword)
// verifyToken()
// getCurrentAdmin()
```

#### 4.3 Auth Context Enhancement

**File**: `client/src/context/AuthContext.jsx` (Update)

```javascript
// Add methods:
// - changePassword()
// - getCurrentAdmin()
// - isTokenValid()
```

### Phase 5: Frontend Dashboard (3-4 hours)

#### 5.1 Main Dashboard Layout

**File**: `client/src/layouts/MainLayout.jsx` (New)

```javascript
// Sidebar navigation with menu items
// Header with admin name and logout
// Main content area
// Mobile-responsive design
```

#### 5.2 Dashboard Page

**File**: `client/src/pages/DashboardPage.jsx` (Update)

```javascript
// Load statistics from API
// Display in cards
// Implement charts
// Show recent items
// Real-time refresh every 30 seconds
```

#### 5.3 Dashboard Components

**Directory**: `client/src/components/Dashboard/`

```
StatCard.jsx
  - Props: title, value, icon, color, trend
  - Shows statistic with trend indicator

ChartCard.jsx
  - Recharts wrapper
  - Props: title, data, type (line/bar)
  - Responsive design

RecentOrdersCard.jsx
  - Display recent orders in table
  - Status badges

RecentTransactionsCard.jsx
  - Payment transactions
  - Method badges

LowStockCard.jsx
  - Alert list
  - Color coding by severity

OutstandingCustomersCard.jsx
  - Top debtors list
  - Amount due

TopProductsCard.jsx
  - Best sellers list
  - Revenue info
```

#### 5.4 Main Layout Components

**Directory**: `client/src/components/Layout/`

```
Sidebar.jsx
  - Navigation menu
  - Active state highlighting
  - Collapsible on mobile
  - Items:
    * Dashboard
    * Inventory
    * Orders
    * Customers
    * Payments
    * Invoices
    * Reports
    * Settings

Header.jsx
  - Admin name display
  - Logout button
  - Notifications (future)
  - Profile menu (future)

Footer.jsx
  - Copyright info
```

#### 5.5 API Hooks

**File**: `client/src/hooks/useDashboard.js` (New)

```javascript
// Custom hook for dashboard data
// Fetches all statistics
// Implements caching
// Auto-refresh logic
```

### Phase 6: UI Components Library (2 hours)

#### 6.1 Common Components

**Directory**: `client/src/components/Common/`

```
Button.jsx
  - Props: variant, size, disabled, loading
  - Variants: primary, secondary, danger, success

Input.jsx
  - Props: label, type, placeholder, error
  - Integrated validation

Select.jsx
  - Props: label, options, value, onChange
  - Searchable

Modal.jsx
  - Props: title, open, onClose, children
  - Backdrop click to close

Table.jsx
  - Props: columns, data, loading, pagination
  - Sortable headers

Pagination.jsx
  - Props: currentPage, totalPages, onPageChange
  - Previous/Next buttons

Badge.jsx
  - Props: text, color, size
  - Different status colors

Alert.jsx
  - Props: type, message
  - Types: success, error, warning, info

Tabs.jsx
  - Props: tabs, activeTab, onTabChange
  - Tab content switching
```

### Phase 7: Testing & Verification (1-2 hours)

#### 7.1 Backend Testing

```
✓ Admin registration/login
✓ JWT token generation and verification
✓ Password change validation
✓ All dashboard endpoints
✓ Data accuracy (calculations)
✓ Error handling
```

#### 7.2 Frontend Testing

```
✓ Login form submission
✓ Token storage and retrieval
✓ Protected route access
✓ Dashboard loads correctly
✓ Charts render properly
✓ Real-time data updates
✓ Logout functionality
✓ Responsive design
✓ Error messages display
```

## File Checklist

### Backend Files to Create
- [ ] `server/routes/authRoutes.js`
- [ ] `server/routes/dashboardRoutes.js`
- [ ] `server/controllers/authController.js`
- [ ] `server/controllers/dashboardController.js`
- [ ] `server/utils/calculationHelpers.js`
- [ ] `server/routes/index.js` (combine all routes)

### Frontend Files to Create
- [ ] `client/src/api/authAPI.js`
- [ ] `client/src/hooks/useDashboard.js`
- [ ] `client/src/layouts/MainLayout.jsx`
- [ ] `client/src/layouts/SidebarLayout.jsx`
- [ ] `client/src/components/Layout/Sidebar.jsx`
- [ ] `client/src/components/Layout/Header.jsx`
- [ ] `client/src/components/Dashboard/StatCard.jsx`
- [ ] `client/src/components/Dashboard/ChartCard.jsx`
- [ ] `client/src/components/Dashboard/RecentOrdersCard.jsx`
- [ ] `client/src/components/Dashboard/RecentTransactionsCard.jsx`
- [ ] `client/src/components/Dashboard/LowStockCard.jsx`
- [ ] `client/src/components/Dashboard/OutstandingCustomersCard.jsx`
- [ ] `client/src/components/Dashboard/TopProductsCard.jsx`
- [ ] `client/src/components/Common/Button.jsx`
- [ ] `client/src/components/Common/Input.jsx`
- [ ] `client/src/components/Common/Modal.jsx`
- [ ] `client/src/components/Common/Table.jsx`
- [ ] `client/src/components/Common/Badge.jsx`
- [ ] `client/src/components/Common/Alert.jsx`
- [ ] `client/src/utils/formatters.js`
- [ ] `client/src/utils/constants.js`

## Implementation Priority

1. **High Priority**: Auth API, Dashboard statistics API, Main layout, Login page
2. **Medium Priority**: Dashboard components, Charts, Recent items display
3. **Low Priority**: Advanced UI components, Animations

## Success Criteria

- [ ] Admin can create account on first run
- [ ] Admin can login with credentials
- [ ] JWT token is properly validated
- [ ] Dashboard loads all statistics correctly
- [ ] Charts display monthly trends
- [ ] Recent items show current data
- [ ] Logout works properly
- [ ] Protected routes work
- [ ] UI is responsive on all devices
- [ ] All calculations are accurate

## Estimated Timeline

- **Total**: 12-16 hours
- **Backend**: 6-8 hours
- **Frontend**: 6-8 hours

## Notes

- Implement auth first as it's blocking for dashboard
- Use aggregation pipeline for complex calculations
- Cache calculation results to avoid repeated queries
- Implement pagination for large datasets
- Add loading states for better UX
- Handle errors gracefully

## Next Steps After Stage 2

Once authentication and dashboard are complete:

1. Move to Stage 3: Inventory & Purchase Management
2. Implement product CRUD operations
3. Create category management
4. Build purchase recording system
5. Add inventory transaction tracking

---

**Version**: 1.0
**Created**: November 5, 2026
**Status**: Ready for Implementation
