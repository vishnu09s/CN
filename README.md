# Inventory & Business Management System

A comprehensive, production-ready, 100% web-based inventory and business management system built with MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack

- **Frontend**: React.js + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Authentication**: JWT
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **API Communication**: Axios

## Features

### 1. Dashboard
- Business overview (sales, purchases, revenue, outstanding payments)
- Order overview with statuses
- Recent orders and transactions
- Low-stock alerts
- Sales and purchase charts
- Top-selling products

### 2. Inventory Management
- Product CRUD operations
- Stock tracking with low-stock alerts
- Product categories
- Transaction history
- Inventory movement logs

### 3. Purchase Management
- Record purchases from suppliers
- Track supplier information
- Multiple products per purchase
- Automatic inventory updates
- Purchase history and analytics

### 4. Customer Management
- Customer profiles
- Order history
- Payment history
- Outstanding balances
- Customer ledgers

### 5. Order Management
- Complete order lifecycle (7 statuses)
- Inventory reservation system
- Multi-product orders
- Discount management
- Order status tracking

### 6. Dispatch & Delivery
- Dispatch management
- Delivery tracking
- Order status updates
- Dispatch history

### 7. Payment Management
- Flexible payment options (Cash, UPI, Bank Transfer, Cheque)
- Partial and full payments
- Multiple payments per order
- Payment history tracking
- Outstanding balance calculation

### 8. Customer Ledger
- Individual customer accounts
- Transaction history
- Outstanding balance calculation
- Date range filtering
- PDF export

### 9. Invoice Generation
- Professional invoice templates
- PDF download
- Business information configuration
- Tax settings
- Receipt generation

### 10. Reports & Analytics
- Sales reports (daily, weekly, monthly, annual)
- Purchase reports
- Inventory reports
- Customer outstanding reports
- Profit and margin analysis
- PDF and Excel export

### 11. Settings
- Business information
- Logo upload
- Currency and tax settings
- Invoice configuration
- Admin password management

## Project Structure

```
├── server/
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth, validation
│   ├── config/              # Database, environment
│   ├── utils/               # Helper functions
│   └── app.js               # Express app
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API calls
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── .env.example
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Environment Variables

Create `.env` in server directory:

```
MONGODB_URI=mongodb://localhost:27017/inventory-system
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

## Database Architecture

The system uses MongoDB with the following collections:

- **Admin**: Admin user credentials and settings
- **Products**: Product inventory
- **Categories**: Product categories
- **Suppliers**: Supplier information
- **Purchases**: Purchase records
- **Customers**: Customer information
- **Orders**: Customer orders
- **Payments**: Payment records
- **Invoices**: Generated invoices
- **InventoryTransactions**: Stock movement history
- **BusinessSettings**: Business configuration

## API Documentation

### Authentication Routes
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/auth/change-password` - Change password

### Product Routes
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Routes
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/status` - Update order status

### Payment Routes
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment
- `GET /api/payments/order/:orderId` - Get order payments

### More routes documentation coming...

## Development Stages

1. ✅ Project setup and database architecture
2. ⏳ Authentication and dashboard
3. ⏳ Inventory and purchase management
4. ⏳ Customer and order management
5. ⏳ Dispatch and delivery
6. ⏳ Payment management and customer ledger
7. ⏳ Invoice generation
8. ⏳ Reports and analytics
9. ⏳ Testing and deployment

## License

Proprietary - Business Management System

## Support

For issues or questions, contact the development team.
