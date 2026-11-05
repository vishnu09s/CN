# Setup Instructions - Inventory & Business Management System

## Overview

This is a complete MERN stack application for managing inventory, orders, customers, payments, and invoices for a product-based business.

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **MongoDB**: v5.0 or higher (local or MongoDB Atlas cloud)
- **Git**: for version control

## Project Structure

```
inventory-management-system/
├── server/                      # Backend (Node.js + Express)
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API routes
│   ├── controllers/             # Business logic
│   ├── middleware/              # Auth, validation
│   ├── config/                  # Database config
│   ├── utils/                   # Helper functions
│   ├── .env.example             # Environment template
│   ├── package.json
│   └── server.js                # Entry point
├── client/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── api/                 # API calls
│   │   ├── context/             # Context providers
│   │   ├── utils/               # Utilities
│   │   ├── styles/              # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── .env.example
├── package.json
├── README.md
└── SETUP.md
```

## Installation Steps

### 1. Clone or Setup Repository

```bash
cd /path/to/inventory-management-system
```

### 2. Install Dependencies

#### Option A: Install All at Once

```bash
npm run install-all
```

#### Option B: Manual Installation

```bash
# Root dependencies
npm install

# Backend
cd server
npm install
cp .env.example .env

# Frontend
cd ../client
npm install
cp .env.example .env

cd ..
```

### 3. Configure Environment Variables

#### Backend Setup (server/.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Local
MONGODB_URI=mongodb://localhost:27017/inventory-system

# Or MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/inventory-system

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Business
DEFAULT_CURRENCY=INR
DEFAULT_TAX_PERCENTAGE=18
```

#### Frontend Setup (client/.env)

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo service mongod start

# Or manually
mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create an account and cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 5. Create Initial Admin Account

```bash
# Navigate to server directory
cd server

# Run initialization script (to be created)
npm run init
```

For now, you'll need to create an admin account through MongoDB directly or via an API endpoint.

### 6. Start Development Servers

#### Option A: Run Both Simultaneously

```bash
npm run dev
```

This will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

#### Option B: Run Separately

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Database Collections Schema

### 1. Admin
- username: String (unique)
- email: String (unique)
- password: String (hashed)
- createdAt: Date
- lastLogin: Date

### 2. Category
- name: String (unique)
- description: String
- icon: String
- createdAt: Date

### 3. Product
- productId: String (unique)
- name: String
- category: ObjectId (ref: Category)
- description: String
- unit: String (enum)
- purchasePrice: Number
- sellingPrice: Number
- quantity: Number
- reservedQuantity: Number
- minimumThreshold: Number
- isLowStock: Boolean
- image: String
- createdAt: Date

### 4. Supplier
- name: String
- contactPerson: String
- phone: String
- email: String
- address: String
- gstNumber: String
- bankDetails: Object
- totalPurchases: Number
- totalAmountPaid: Number
- isActive: Boolean
- createdAt: Date

### 5. Customer
- customerId: String (unique)
- name: String
- phone: String
- email: String
- address: String
- businessName: String
- gstNumber: String
- totalOrders: Number
- totalPurchased: Number
- totalPaid: Number
- outstandingBalance: Number
- creditLimit: Number
- isActive: Boolean
- registrationDate: Date
- createdAt: Date

### 6. Purchase
- purchaseId: String (unique)
- supplier: ObjectId (ref: Supplier)
- purchaseDate: Date
- items: Array of Objects
- subtotal: Number
- additionalExpenses: Number
- tax: Number
- totalAmount: Number
- paymentStatus: String (enum)
- amountPaid: Number
- pendingAmount: Number
- status: String (enum)
- createdAt: Date

### 7. Order
- orderId: String (unique)
- customer: ObjectId (ref: Customer)
- orderDate: Date
- items: Array of Objects
- subtotal: Number
- totalDiscount: Number
- tax: Number
- totalAmount: Number
- deliveryAddress: String
- expectedDeliveryDate: Date
- actualDeliveryDate: Date
- orderStatus: String (enum)
- paymentStatus: String (enum)
- totalPaid: Number
- pendingAmount: Number
- reservedInventory: Array
- trackingNumber: String
- dispatchDate: Date
- invoiceGenerated: Boolean
- invoice: ObjectId (ref: Invoice)
- createdAt: Date

### 8. Payment
- paymentId: String (unique)
- customer: ObjectId (ref: Customer)
- order: ObjectId (ref: Order)
- amount: Number
- paymentDate: Date
- paymentMethod: String (enum)
- transactionReference: String
- status: String (enum)
- createdAt: Date

### 9. Invoice
- invoiceNumber: String (unique)
- order: ObjectId (ref: Order)
- customer: ObjectId (ref: Customer)
- invoiceDate: Date
- items: Array of Objects
- subtotal: Number
- tax: Number
- totalAmount: Number
- amountReceived: Number
- pendingBalance: Number
- paymentStatus: String (enum)
- createdAt: Date

### 10. InventoryTransaction
- product: ObjectId (ref: Product)
- transactionType: String (enum)
- quantity: Number
- previousQuantity: Number
- newQuantity: Number
- reference: Object
- notes: String
- createdAt: Date

### 11. BusinessSettings
- businessName: String
- businessLogo: String
- businessEmail: String
- businessPhone: String
- businessAddress: Object
- gstNumber: String
- bankDetails: Object
- invoiceSettings: Object
- taxSettings: Object
- inventorySettings: Object
- paymentMethods: Object
- createdAt: Date

## API Endpoints (To be implemented)

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/status` - Update order status

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment
- `GET /api/payments/order/:orderId` - Get order payments

### More endpoints coming...

## Development Notes

### Technology Stack Versions
- React: ^18.2.0
- Express: ^4.18.2
- MongoDB/Mongoose: ^8.0.0
- Tailwind CSS: ^3.3.0
- Vite: ^5.0.0

### Key Libraries
- **Authentication**: JWT + bcryptjs
- **API**: Axios
- **Forms**: React Hook Form (to be added)
- **Charts**: Recharts
- **PDF**: jsPDF + html2canvas
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### Deployment Targets
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, Render
- **Database**: MongoDB Atlas
- **File Storage**: AWS S3 (optional)

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall/network settings

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS Errors
- Verify `CORS_ORIGIN` matches frontend URL
- Check backend CORS middleware

### Module Not Found Errors
- Run `npm install` again
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Development Workflow

### Stage 1: Project Setup ✓ (CURRENT)
- [x] Project structure
- [x] Database schemas
- [x] Backend configuration
- [x] Frontend setup
- [ ] Initial admin creation

### Stage 2: Authentication & Dashboard
- [ ] Admin registration & login
- [ ] JWT implementation
- [ ] Dashboard statistics
- [ ] Charts and analytics

### Stage 3: Inventory & Purchase Management
- [ ] Product CRUD
- [ ] Category management
- [ ] Purchase records
- [ ] Inventory tracking

### Stage 4: Customer & Order Management
- [ ] Customer profiles
- [ ] Order creation & management
- [ ] Order status tracking
- [ ] Inventory reservation

### Stage 5: Dispatch & Delivery
- [ ] Dispatch management
- [ ] Delivery tracking
- [ ] Tracking numbers
- [ ] Delivery confirmation

### Stage 6: Payment & Ledger
- [ ] Payment recording
- [ ] Payment methods
- [ ] Customer ledger
- [ ] Outstanding balance tracking

### Stage 7: Invoice Generation
- [ ] Invoice templates
- [ ] PDF generation
- [ ] Invoice storage
- [ ] Receipt generation

### Stage 8: Reports & Analytics
- [ ] Sales reports
- [ ] Purchase reports
- [ ] Inventory reports
- [ ] Profit analysis

### Stage 9: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Cloud deployment

## Next Steps

1. Create initial admin account
2. Implement authentication API endpoints
3. Build dashboard components
4. Connect frontend to backend APIs
5. Continue with remaining stages

## Support & Documentation

For detailed documentation on each module, see the respective README files:
- Backend: `server/README.md` (to be created)
- Frontend: `client/README.md` (to be created)

## License

Proprietary - Business Management System

---

**Last Updated**: November 5, 2026
**Status**: Stage 1 Complete - Project Setup Done
