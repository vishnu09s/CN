# System Architecture - Inventory & Business Management System

## Overview

This document describes the complete architecture of the Inventory & Business Management System built with MERN stack (MongoDB, Express, React, Node.js).

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcryptjs
- **Validation**: validator.js

### Frontend
- **Library**: React.js
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI Components**: Lucide React (icons)
- **Charts**: Recharts
- **PDF Export**: jsPDF + html2canvas
- **Notifications**: React Hot Toast

### DevOps
- **Package Manager**: npm
- **Version Control**: Git
- **Deployment**: Cloud platforms (Vercel, Heroku, MongoDB Atlas)

## Database Design

### Collections & Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    Admin (Auth)                         │
│  - Single admin authentication                          │
│  - Password hashed with bcrypt                          │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐          ┌──────────────────────┐
│   Category       │◄────────►│  Product             │
│  - name          │          │  - productId         │
│  - description   │          │  - name              │
│  - icon          │          │  - category (ref)    │
│                  │          │  - quantity          │
│                  │          │  - purchasePrice     │
│                  │          │  - sellingPrice      │
│                  │          │  - minimumThreshold  │
│                  │          │  - reservedQuantity  │
│                  │          │  - isLowStock        │
└──────────────────┘          └──────────────────────┘

┌──────────────────┐          ┌──────────────────────┐
│   Supplier       │◄────────►│  Purchase            │
│  - name          │          │  - purchaseId        │
│  - phone         │          │  - supplier (ref)    │
│  - email         │          │  - purchaseDate      │
│  - address       │          │  - items[]           │
│  - gstNumber     │          │  - totalAmount       │
│  - bankDetails   │          │  - paymentStatus     │
│  - paymentTerms  │          │  - amountPaid        │
│                  │          │  - status            │
└──────────────────┘          └──────────────────────┘

┌──────────────────┐          ┌──────────────────────┐
│   Customer       │◄────────►│  Order               │
│  - customerId    │          │  - orderId           │
│  - name          │          │  - customer (ref)    │
│  - phone         │          │  - items[]           │
│  - email         │          │  - orderDate         │
│  - address       │          │  - orderStatus       │
│  - gstNumber     │          │  - paymentStatus     │
│  - totalOrders   │          │  - deliveryAddress   │
│  - totalPaid     │          │  - reservedInventory │
│  - outstanding   │          │  - trackingNumber    │
└──────────────────┘          │  - invoice (ref)     │
         │                    └──────────────────────┘
         │                             │
         │                    ┌────────┴─────────┐
         │                    │                  │
         │            ┌──────────────┐  ┌──────────────┐
         │            │   Invoice    │  │   Payment    │
         │            │ - invoiceNum │  │ - paymentId  │
         │            │ - order(ref) │  │ - order(ref) │
         │            │ - items[]    │  │ - amount     │
         │            │ - totalAmt   │  │ - method     │
         │            │ - amountRcvd │  │ - reference  │
         │            │ - balance    │  │ - date       │
         │            └──────────────┘  └──────────────┘
         │
         └─────────────┬───────────────────────────────┐
                       │                               │
            ┌──────────────────────┐        ┌─────────────────────┐
            │ InventoryTransaction │        │ BusinessSettings    │
            │ - product (ref)      │        │ - businessName      │
            │ - transactionType    │        │ - businessLogo      │
            │ - quantity           │        │ - businessEmail     │
            │ - reference          │        │ - businessPhone     │
            │ - previousQty        │        │ - bankDetails       │
            │ - newQty             │        │ - invoiceSettings   │
            │ - createdAt          │        │ - taxSettings       │
            └──────────────────────┘        │ - inventorySettings │
                                           │ - paymentMethods    │
                                           └─────────────────────┘
```

## Data Flow

### Order Processing Flow

```
1. Customer Creation
   └─> Customer record with ID, details, limits

2. Order Creation
   └─> Check stock availability
   └─> Create Order record
   └─> Reserve inventory (product quantity)
   └─> Create InventoryTransaction (Reservation)

3. Order Acceptance/Processing
   └─> Update OrderStatus → "Accepted"/"Processing"
   └─> Confirm reservation

4. Order Dispatch
   └─> Update OrderStatus → "Ready for Dispatch"
   └─> Generate Invoice (optional)
   └─> Record dispatch date & tracking
   └─> Deduct from physical inventory
   └─> Create InventoryTransaction (Dispatch)
   └─> Update OrderStatus → "Dispatched"

5. Order Delivery
   └─> Update OrderStatus → "Delivered"
   └─> Record delivery date
   └─> Create InventoryTransaction (if any)

6. Payment Processing
   └─> Record Payment
   └─> Update totalPaid
   └─> Update paymentStatus
   └─> Update customer outstanding balance
   └─> Update Order payment status

7. Cancellation (if before dispatch)
   └─> Update OrderStatus → "Cancelled"
   └─> Release reserved inventory
   └─> Create InventoryTransaction (Cancellation)
   └─> Refund payment if received
```

### Inventory Management Flow

```
Purchase Addition:
  Supplier → Purchase Record → Item Details
    └─> InventoryTransaction (Type: Purchase Addition)
    └─> Update Product.quantity
    └─> Update Product.isLowStock

Reservation (Order):
  Order Creation → Reserve Items
    └─> InventoryTransaction (Type: Order Reservation)
    └─> Update Product.reservedQuantity
    └─> Prevent negative inventory

Dispatch:
  Order Dispatch → Deduct from Inventory
    └─> InventoryTransaction (Type: Order Dispatch)
    └─> Decrease Product.quantity
    └─> Decrease Product.reservedQuantity

Cancellation:
  Order Cancellation → Release Inventory
    └─> InventoryTransaction (Type: Order Cancellation)
    └─> Increase Product.quantity (if not dispatched)
    └─> Decrease Product.reservedQuantity

Low Stock Alert:
  Product.quantity ≤ minimumThreshold
    └─> Set Product.isLowStock = true
    └─> Display in Dashboard
```

## API Architecture

### RESTful Endpoint Structure

```
/api/
├── auth/
│   ├── POST /login
│   ├── POST /logout
│   └── POST /change-password
├── products/
│   ├── GET / (all products)
│   ├── GET /:id
│   ├── POST / (create)
│   ├── PUT /:id (update)
│   ├── DELETE /:id
│   └── GET /:id/transactions (history)
├── categories/
│   ├── GET /
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── suppliers/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── purchases/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── PUT /:id/payment
├── customers/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   ├── GET /:id/ledger
│   └── GET /:id/outstanding
├── orders/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   ├── PUT /:id/status
│   ├── PUT /:id/accept
│   ├── PUT /:id/cancel
│   └── PUT /:id/dispatch
├── payments/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── GET /order/:orderId
│   └── DELETE /:id
├── invoices/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── GET /:id/pdf
│   └── PUT /:id
├── dashboard/
│   ├── GET /statistics
│   ├── GET /sales
│   ├── GET /orders
│   ├── GET /low-stock
│   ├── GET /outstanding
│   └── GET /recent
├── reports/
│   ├── GET /sales
│   ├── GET /purchases
│   ├── GET /inventory
│   ├── GET /customer-outstanding
│   └── GET /payment-collection
├── settings/
│   ├── GET /
│   ├── PUT /
│   └── POST /logo (upload)
└── inventory-transactions/
    ├── GET /
    ├── GET /product/:productId
    └── GET /reference/:referenceId
```

## Frontend Component Structure

```
src/
├── components/
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx (to be created)
│   ├── Header.jsx (to be created)
│   ├── Dashboard/
│   │   ├── StatCard.jsx
│   │   ├── ChartCard.jsx
│   │   └── RecentItems.jsx
│   ├── Products/
│   │   ├── ProductList.jsx
│   │   ├── ProductForm.jsx
│   │   └── ProductDetail.jsx
│   ├── Orders/
│   │   ├── OrderList.jsx
│   │   ├── OrderForm.jsx
│   │   └── OrderDetail.jsx
│   ├── Customers/
│   │   ├── CustomerList.jsx
│   │   ├── CustomerForm.jsx
│   │   └── CustomerLedger.jsx
│   ├── Payments/
│   │   ├── PaymentForm.jsx
│   │   ├── PaymentList.jsx
│   │   └── PaymentHistory.jsx
│   ├── Invoices/
│   │   ├── InvoiceList.jsx
│   │   ├── InvoiceTemplate.jsx
│   │   └── InvoiceGenerator.jsx
│   ├── Reports/
│   │   ├── SalesReport.jsx
│   │   ├── PurchaseReport.jsx
│   │   └── InventoryReport.jsx
│   ├── Settings/
│   │   └── SettingsForm.jsx
│   └── Common/
│       ├── Table.jsx
│       ├── Modal.jsx
│       ├── Form.jsx
│       └── Loader.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProductsPage.jsx
│   ├── OrdersPage.jsx
│   ├── CustomersPage.jsx
│   ├── PaymentsPage.jsx
│   ├── InvoicesPage.jsx
│   ├── ReportsPage.jsx
│   └── SettingsPage.jsx
├── api/
│   ├── axios.js
│   ├── authAPI.js
│   ├── productAPI.js
│   ├── orderAPI.js
│   ├── customerAPI.js
│   ├── paymentAPI.js
│   ├── invoiceAPI.js
│   └── reportAPI.js
├── context/
│   ├── AuthContext.jsx
│   └── AppContext.jsx (to be created)
├── hooks/ (to be created)
│   ├── useAuth.js
│   ├── useAPI.js
│   └── useForm.js
├── utils/
│   ├── helpers.js
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
├── styles/
│   ├── globals.css
│   └── animations.css (to be created)
├── App.jsx
└── main.jsx
```

## Authentication Flow

```
1. User enters credentials
   └─> Frontend sends POST /api/auth/login

2. Backend validates
   └─> Find admin by username
   └─> Compare password with bcrypt.compare()
   └─> If valid, generate JWT token

3. Backend returns token
   └─> { token, admin: {...} }

4. Frontend stores token
   └─> localStorage.setItem('authToken', token)
   └─> Store admin data

5. API Interceptor
   └─> Every request includes Authorization header
   └─> "Authorization: Bearer <token>"

6. Backend verification
   └─> Middleware checks JWT
   └─> If valid, attach admin to request
   └─> If invalid, return 401

7. Token Expiry
   └─> After 7 days, token expires
   └─> User must login again
   └─> Frontend catches 401 and redirects to login

8. Logout
   └─> Clear localStorage
   └─> Clear context
   └─> Redirect to login page
```

## Business Logic

### Payment Calculation

```
Total Order Amount = Sum of (Quantity × Selling Price - Discount) for all items + Tax

Payment Status:
- If totalPaid === 0              → "Unpaid"
- If totalPaid > 0 && totalPaid < totalAmount  → "Partially Paid"
- If totalPaid >= totalAmount     → "Fully Paid"

Outstanding Balance = Total Order Amount - Total Paid Amount

Customer Outstanding = Sum of all order outstanding balances
```

### Inventory Calculation

```
Available Quantity = Total Quantity - Reserved Quantity

Low Stock Check = If Available Quantity ≤ Minimum Threshold → isLowStock = true

Reserved Inventory:
- When order is accepted → Reserve quantity
- When order is dispatched → Deduct from physical
- When order is cancelled → Release reservation

Transactions Log:
- Purchase Addition (increases quantity)
- Stock Adjustment (manual update)
- Order Reservation (reserves quantity)
- Order Dispatch (decreases quantity)
- Order Cancellation (restores quantity)
- Stock Damage (decreases quantity)
- Stock Return (increases quantity)
- Manual Adjustment (custom adjustment)
```

### Revenue Calculation

```
Revenue = Sum of (Total Order Amount where paymentStatus = "Fully Paid")

Cash Collected = Sum of (Total Paid Amount for all orders)

Outstanding Receivables = Sum of (Pending Amount for all orders)

Estimated Profit = Revenue - Cost of Goods Sold

Cost of Goods Sold = Sum of (Average Purchase Price × Quantity Dispatched)
```

## Security Measures

### Backend
- Password hashing with bcrypt (10 rounds)
- JWT token validation on protected routes
- Input validation on all endpoints
- MongoDB injection prevention via Mongoose
- CORS configuration
- Error handling without exposing stack traces
- Environment variables for secrets

### Frontend
- Token stored in localStorage (can be upgraded to httpOnly cookies)
- Protected routes redirect to login
- API interceptor handles 401 responses
- HTTPS in production
- XSS prevention via React's built-in escaping

### Database
- MongoDB connection requires authentication
- Collections have proper indexes
- Data validation at schema level
- Referential integrity via ObjectId references

## Performance Optimization

### Database
- Indexes on frequently queried fields
- Pagination on list endpoints
- Lean queries for read-only operations
- Aggregation for complex calculations

### Frontend
- Code splitting with Vite
- Lazy loading of routes
- Memoization of expensive components
- Local state for UI, global only for auth
- Virtual scrolling for large tables

### Backend
- Connection pooling with MongoDB
- Response compression
- Caching with Redis (optional)
- Rate limiting (to be added)

## Deployment Strategy

### Production Checklist

Backend:
- [ ] Use production MongoDB Atlas
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up SSL certificate
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Set up error logging (Sentry)
- [ ] Enable request logging
- [ ] Set up database backups

Frontend:
- [ ] Build optimization
- [ ] Environment variables
- [ ] Analytics setup
- [ ] Error tracking
- [ ] Performance monitoring

### Hosting Options

Backend: Heroku, Railway, Render, Vercel (serverless)
Frontend: Vercel, Netlify, GitHub Pages
Database: MongoDB Atlas
Storage: AWS S3 (if needed)

## Scalability Considerations

### Current Implementation
- Single admin user
- Optimized for small to medium businesses
- Real-time data (no caching)

### Future Improvements
- Multi-user authentication (roles & permissions)
- Redis caching layer
- Message queues for async tasks
- Microservices architecture
- GraphQL API
- Subscription model for updates
- Mobile app (React Native)

## Testing Strategy

### Unit Tests
- Helper functions
- Validators
- Formatters

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### End-to-End Tests
- Complete order workflow
- Payment processing
- Invoice generation

### Testing Tools (to be added)
- Jest (unit tests)
- Supertest (API tests)
- Cypress (E2E tests)

## Maintenance & Monitoring

### Regular Tasks
- Database backups
- Security updates
- Dependency updates
- Performance monitoring
- Error log review
- User feedback collection

### Metrics to Track
- API response times
- Database query performance
- Error rates
- User activity
- Feature usage

---

**Document Version**: 1.0
**Last Updated**: November 5, 2026
**Status**: Stage 1 Complete
