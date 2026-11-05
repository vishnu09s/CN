# Inventory Management System - API Documentation

## Overview
Complete REST API for product-based business inventory management system with authentication, inventory tracking, order management, payment processing, and reporting capabilities.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login`) require JWT authentication:
```
Authorization: Bearer <token>
```

## Error Handling
All responses follow standard format:
```json
{
  "success": true/false,
  "message": "Error message if applicable",
  "data": {},
  "pagination": {}
}
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login and get JWT token
- `POST /auth/logout` - Logout (optional)

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `GET /categories/:id` - Get category details
- `PUT /categories/:id` - Update category

### Products
- `GET /products` - List products with pagination
- `POST /products` - Create product
- `GET /products/:id` - Get product details
- `PUT /products/:id` - Update product
- `PUT /products/:id/quantity` - Update product quantity

### Suppliers
- `GET /suppliers` - List all suppliers
- `POST /suppliers` - Create supplier
- `GET /suppliers/:id` - Get supplier details
- `PUT /suppliers/:id` - Update supplier

### Purchases
- `GET /purchases` - List purchase orders
- `POST /purchases` - Create purchase order
- `GET /purchases/:id` - Get purchase details
- `PUT /purchases/:id/status` - Update purchase status

### Customers
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer details
- `PUT /customers/:id` - Update customer
- `PUT /customers/:id/deactivate` - Deactivate customer

### Orders
- `GET /orders` - List orders with filtering
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status
- `PUT /orders/:id/payment-status` - Update payment status
- `GET /orders/customer/:customerId` - Get customer orders

### Dispatch
- `GET /dispatch` - List dispatches
- `POST /dispatch` - Create dispatch
- `GET /dispatch/:id` - Get dispatch details
- `GET /dispatch/tracking/:trackingNumber` - Track shipment (public)
- `PUT /dispatch/:id/status` - Update dispatch status
- `POST /dispatch/:id/confirm-delivery` - Confirm delivery
- `POST /dispatch/:id/failed-delivery` - Mark delivery as failed
- `GET /dispatch/customer/:customerId` - Get customer dispatches

### Payments
- `GET /payments` - List payments
- `POST /payments` - Record payment
- `GET /payments/:id` - Get payment details
- `PUT /payments/:id` - Update payment status
- `GET /payments/stats` - Payment statistics
- `GET /payments/customer/:customerId` - Get customer payments

### Customer Ledger
- `GET /ledger` - List all customer ledgers
- `GET /ledger/customer/:customerId` - Get customer ledger
- `GET /ledger/customer/:customerId/summary` - Get ledger summary
- `POST /ledger/customer/:customerId` - Add ledger entry

### Invoices
- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `GET /invoices/:id` - Get invoice details
- `PUT /invoices/:id` - Update invoice
- `GET /invoices/number/:invoiceId` - Get invoice by number (public)
- `POST /invoices/:id/send` - Send invoice
- `POST /invoices/:id/mark-paid` - Mark invoice as paid
- `POST /invoices/:id/cancel` - Cancel invoice
- `GET /invoices/customer/:customerId` - Get customer invoices

### Reports
- `GET /reports/dashboard-stats` - Quick dashboard statistics
- `GET /reports/sales` - Sales report with period options
- `GET /reports/inventory` - Inventory analysis
- `GET /reports/customers` - Customer report
- `GET /reports/orders` - Order report
- `GET /reports/payments` - Payment report
- `GET /reports/profit-loss` - Profit & Loss report

## Request Examples

### Login
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Create Product
```bash
POST /products
Authorization: Bearer <token>
{
  "productName": "Product Name",
  "productId": "PROD-001",
  "category": "category-id",
  "purchasePrice": 100,
  "sellingPrice": 150,
  "quantity": 50,
  "minimumThreshold": 10,
  "unit": "pieces"
}
```

### Create Order
```bash
POST /orders
Authorization: Bearer <token>
{
  "customer": "customer-id",
  "items": [
    {
      "product": "product-id",
      "quantity": 10,
      "rate": 150
    }
  ],
  "totalAmount": 1500
}
```

### Record Payment
```bash
POST /payments
Authorization: Bearer <token>
{
  "order": "order-id",
  "customer": "customer-id",
  "amount": 1500,
  "paymentMethod": "Bank Transfer",
  "reference": "TRF-12345"
}
```

### Create Invoice
```bash
POST /invoices
Authorization: Bearer <token>
{
  "order": "order-id",
  "customer": "customer-id",
  "items": [...],
  "subtotal": 1000,
  "taxAmount": 100,
  "discount": 0,
  "total": 1100
}
```

## Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "productName": "Product Name",
    ...
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid product ID",
  "data": null
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "pages": 5,
    "total": 100
  }
}
```

## Data Models

### Product
- `productId`: String (unique)
- `productName`: String
- `category`: ObjectId
- `purchasePrice`: Number
- `sellingPrice`: Number
- `quantity`: Number
- `reservedQuantity`: Number
- `minimumThreshold`: Number
- `isLowStock`: Boolean
- `description`: String

### Customer
- `customerId`: String (unique)
- `name`: String
- `email`: String
- `phone`: String
- `address`: String
- `creditLimit`: Number
- `outstanding`: Number
- `isActive`: Boolean

### Order
- `orderId`: String (unique)
- `customer`: ObjectId
- `items`: Array
- `totalAmount`: Number
- `status`: String (Pending, Confirmed, etc.)
- `paymentStatus`: String (Unpaid, Paid, Partial)
- `orderDate`: Date

### Invoice
- `invoiceId`: String (unique)
- `order`: ObjectId
- `customer`: ObjectId
- `items`: Array
- `total`: Number
- `status`: String (Draft, Sent, Paid, etc.)
- `invoiceDate`: Date
- `dueDate`: Date

### Payment
- `paymentId`: String (unique)
- `order`: ObjectId
- `customer`: ObjectId
- `amount`: Number
- `paymentMethod`: String
- `status`: String (Pending, Completed, Failed)
- `paymentDate`: Date

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Filtering
- `status` - Filter by status
- `customer` - Filter by customer
- `startDate` - Filter by start date
- `endDate` - Filter by end date

## Rate Limiting
Currently no rate limiting implemented. Consider adding for production.

## CORS
CORS is enabled for configured origins. Update `CORS_ORIGIN` in `.env`.

## Security
- JWT authentication on all protected endpoints
- Password hashing with bcrypt
- Input validation on all endpoints
- HTTPS required in production
- Consider implementing rate limiting
- Enable CORS only for trusted origins
