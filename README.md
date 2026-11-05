# Inventory & Business Management System

A complete, production-ready MERN stack application for managing inventory, orders, customers, payments, dispatches, and business analytics for product-based businesses.

## 🎯 Features

### Core Functionality
- ✅ Complete inventory management with stock tracking
- ✅ Multi-step order lifecycle management
- ✅ Customer management with credit limits
- ✅ Supplier and purchase order tracking
- ✅ Payment processing with multiple methods
- ✅ Invoice generation and tracking
- ✅ Dispatch and delivery management
- ✅ Real-time tracking for customers
- ✅ Comprehensive business reports and analytics
- ✅ Customer ledger with double-entry accounting
- ✅ Dashboard with real-time statistics

### Technical Features
- 🔐 JWT authentication with bcrypt password hashing
- 📱 Responsive mobile-first UI design
- 📊 Interactive charts and visualizations
- 🎨 Professional invoice templates
- 📧 Automatic order status tracking
- 💾 MongoDB for data persistence
- 🚀 Optimized performance with aggregation pipelines
- 🧪 Comprehensive test suite
- 🐳 Docker containerization
- 🔄 CI/CD pipeline with GitHub Actions

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **Validation**: Custom middleware

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: Context API
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5+
- npm or yarn
- Git

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/vishnu09s/CN.git
cd CN
```

### 2. Environment Setup
```bash
# Copy example env file
cp .env.example .env

# Update .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/inventory_management
# JWT_SECRET=your_secret_key
```

### 3. Backend Setup
```bash
cd server
npm install
npm start
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 5. Database Setup
Ensure MongoDB is running:
```bash
mongod
```

## 🐳 Docker Setup

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend on port 5000
- Frontend (access via browser)

### Manual Docker Build
```bash
# Build image
docker build -t inventory-management .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/inventory_management \
  inventory-management
```

## 📦 Project Structure

```
CN/
├── server/                 # Backend
│   ├── models/            # MongoDB schemas
│   ├── controllers/       # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication, validation
│   ├── config/           # Database config
│   └── server.js         # Entry point
│
├── client/                # Frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── api/        # API calls
│   │   ├── layouts/    # Layout wrappers
│   │   ├── context/    # Context providers
│   │   └── App.jsx     # Main component
│   └── package.json
│
├── docker-compose.yml    # Docker setup
├── Dockerfile           # Container image
└── README.md           # This file
```

## 🔑 Default Credentials

**Email**: admin@test.com
**Password**: password123

⚠️ Change these immediately in production!

## 📖 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Examples

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

#### List Products
```bash
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>"
```

## 🗂️ Database Models

### Implemented Models (Stage 1-8)
1. **Admin** - User authentication
2. **Category** - Product categories
3. **Product** - Product inventory
4. **Supplier** - Supplier information
5. **Customer** - Customer profiles
6. **Purchase** - Purchase orders
7. **Order** - Customer orders
8. **Payment** - Payment records
9. **Invoice** - Invoice generation
10. **InventoryTransaction** - Audit trail
11. **Dispatch** - Shipment tracking
12. **CustomerLedger** - Accounting records
13. **BusinessSettings** - Configuration

## 📊 Features by Stage

### Stage 1: Core Setup
- Database models
- Authentication
- Dashboard

### Stage 2-4: Inventory & Purchasing
- Product management
- Category management
- Supplier management
- Purchase orders

### Stage 5: Dispatch & Delivery
- Dispatch creation
- Tracking numbers
- Delivery confirmation
- Customer tracking page

### Stage 6: Payment Management
- Payment recording
- Multiple payment methods
- Customer ledger
- Balance tracking

### Stage 7: Invoice Generation
- Auto-generated invoice IDs
- Professional templates
- Status tracking
- Print support

### Stage 8: Reports & Analytics
- Sales reports
- Inventory analysis
- Customer insights
- Profit/Loss analysis
- Interactive dashboards

### Stage 9: Testing & Deployment
- Test suite
- Docker containerization
- CI/CD pipeline
- API documentation

## 🧪 Testing

### Run Tests
```bash
cd server
npm test
```

### Manual Testing
1. Start server: `npm start`
2. Start client: `npm run dev`
3. Login with default credentials
4. Test various features

## 📈 Performance Optimization

- MongoDB aggregation pipelines for complex queries
- Pagination on all list endpoints
- Indexed fields for faster queries
- Frontend code splitting with Vite
- API request caching with axios

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Error handling without exposing sensitive data
- Environment variable configuration

## 🚢 Deployment

### Heroku
```bash
git push heroku main
```

### AWS EC2
1. Launch Ubuntu instance
2. Install Node.js and MongoDB
3. Clone repository
4. Set environment variables
5. Run `npm start`

### DigitalOcean
Similar to AWS, use App Platform or Droplets

### Vercel (Frontend only)
```bash
cd client
npm run build
# Deploy dist folder to Vercel
```

## 📝 Environment Variables

See `.env.example` for all available variables:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - JWT signing key
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origins

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
mongod

# Or use Docker
docker run -p 27017:27017 mongo:latest
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### CORS Error
```bash
# Update CORS_ORIGIN in .env
CORS_ORIGIN=http://your-frontend-url
```

## 📚 Learn More

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For support, email support@inventorysystem.com or open an issue on GitHub.

## 🎉 Acknowledgments

- Built with MERN stack
- Tailwind CSS for styling
- Recharts for visualizations
- MongoDB for data persistence

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
