# Artisan Management System Backend

A comprehensive backend API for a marketplace application supporting artisans, distributors, and customers with full authentication, authorization, and identity verification capabilities.

## 🌟 Key Features

### Authentication & Authorization
- **Multi-Authentication Methods**: Phone number + password, Google OAuth 2.0
- **OTP Verification**: Phone number verification using Twilio
- **JWT Security**: Access tokens + refresh tokens with secure HTTP-only cookies
- **Role-Based Access Control**: Customer, Artisan, Distributor, Admin roles
- **Account Security**: Rate limiting, account lockout, password strength validation

### Identity Verification System
- **Document Upload**: Aadhaar Card, Driver's License, PAN Card support
- **Admin Review Process**: Manual verification workflow
- **Seller Protection**: Only verified artisans/distributors can sell products
- **Secure Storage**: Encrypted document storage with access controls

### Address Management
- **Complete Address System**: House No, Street, City, District, PinCode
- **Multiple Addresses**: Support for multiple delivery addresses per user
- **Order Requirements**: Mandatory address verification before order placement
- **Address Validation**: Format validation and PinCode verification

### Marketplace Features
- **Public Browsing**: Browse products and search users without authentication
- **Profile Viewing**: View artisan/distributor profiles publicly
- **Advanced Search**: Search by skills, region, name with pagination
- **Role-Specific Dashboards**: Different dashboards based on user role

### Security & Compliance
- **Rate Limiting**: Request throttling with role-based limits
- **Input Validation**: Comprehensive validation for all endpoints
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **GDPR Ready**: Data privacy and consent management

## 🏗️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM (v8.16.1)
- **Authentication**: JWT + Passport.js + Google OAuth 2.0
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator
- **File Upload**: multer
- **OTP Service**: Twilio Verify API
- **Environment**: dotenv

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete installation and configuration guide
- **[API Documentation](API_DOCUMENTATION.md)** - Comprehensive API reference
- **[Authentication Guide](AUTHENTICATION_DOCUMENTATION.md)** - Detailed authentication system overview

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Twilio account (for OTP verification)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment setup:**
```bash
cp env.template .env
# Edit .env with your configuration
```

4. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. **Verify installation:**
```bash
curl http://localhost:3000/api/health
```

## 🔐 Authentication System Overview

### Supported Authentication Methods
1. **Phone + Password**: Traditional registration with phone verification
2. **Google OAuth 2.0**: Seamless Google account integration
3. **OTP Verification**: Phone number verification for security

### User Roles & Permissions

| Role | Browsing | Ordering | Dashboard | Verification Required | Selling |
|------|----------|----------|-----------|----------------------|---------|
| **Customer** | ✅ Public | ✅ With Address | ❌ | ❌ | ❌ |
| **Artisan** | ✅ Public | ❌ | ✅ | ✅ For Selling | ✅ |
| **Distributor** | ✅ Public | ❌ | ✅ | ✅ For Selling | ✅ |
| **Admin** | ✅ Full Access | ✅ | ✅ | ❌ | ✅ |

### Security Features
- **JWT Tokens**: 1-hour access tokens + 7-day refresh tokens
- **Rate Limiting**: 100 general / 5 auth / 3 OTP requests per 15 minutes
- **Account Lockout**: 5 failed attempts = 2-hour lockout
- **Password Requirements**: 8+ chars, mixed case, numbers, special characters
- **Input Validation**: Comprehensive validation for all endpoints

## 📋 Core API Endpoints

### Authentication
```
POST   /api/auth/register           # Register with phone
POST   /api/auth/login              # Login with phone/email
GET    /api/auth/google             # Google OAuth
POST   /api/auth/send-otp           # Send OTP
POST   /api/auth/verify-otp         # Verify OTP
POST   /api/auth/refresh-token      # Refresh access token
GET    /api/auth/profile            # Get user profile
POST   /api/auth/logout             # Logout
```

### Address Management
```
POST   /api/auth/addresses          # Add address
GET    /api/auth/addresses          # Get all addresses
GET    /api/auth/addresses/default  # Get default address
PUT    /api/auth/addresses/:id      # Update address
DELETE /api/auth/addresses/:id      # Delete address
```

### Identity Verification
```
POST   /api/auth/verification/upload           # Upload document
GET    /api/auth/verification/status           # Get verification status
GET    /api/auth/verification/documents        # Get documents
PATCH  /api/auth/admin/verifications/:id       # Admin review
```

### Public Search
```
GET    /api/users/search                      # Search users
GET    /api/artisans/search/skills            # Search by skills
GET    /api/artisans/search/region            # Search by region
```

## 🛡️ Security Best Practices

### Environment Variables
```env
# Strong JWT secrets (64+ characters)
JWT_ACCESS_SECRET=your_very_long_and_random_secret_key
JWT_REFRESH_SECRET=another_very_long_and_random_secret_key

# Secure database connection
MONGO_URI=mongodb://username:password@host:port/database

# Production settings
NODE_ENV=production
COOKIE_SECURE=true
```

### Rate Limiting Configuration
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes  
- **OTP Endpoints**: 3 requests per 15 minutes
- **Account lockout**: 5 failed login attempts

### File Upload Security
- **Allowed types**: JPEG, PNG, PDF only
- **Size limit**: 5MB maximum
- **Secure storage**: Encrypted file storage
- **Access control**: Admin-only document access

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique, sparse),
  phone: String (unique, sparse),
  password: String (hashed),
  role: ['customer', 'artisan', 'distributor', 'admin'],
  addresses: [AddressSchema],
  authProvider: ['local', 'google'],
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  isIdentityVerified: Boolean,
  verificationDocuments: [DocumentSchema],
  refreshTokens: [TokenSchema],
  loginAttempts: Number,
  lockUntil: Date
}
```

### Address Schema
```javascript
{
  houseNo: String (required),
  street: String (required),
  city: String (required),
  district: String (required),
  pinCode: String (required, 6 digits),
  isDefault: Boolean
}
```

## 🔧 Development

### Project Structure
```
Backend/
├── app.js                 # Main application
├── package.json          # Dependencies
├── config/
│   └── passport.js       # Passport configuration
├── controllers/          # Business logic
├── middleware/           # Auth, validation, rate limiting
├── models/              # Database schemas
├── routes/              # API routes
├── services/            # External services
└── uploads/             # File storage
```

### Adding New Features
1. **New Routes**: Add to appropriate route file
2. **Controllers**: Implement business logic
3. **Validation**: Add input validation
4. **Tests**: Create comprehensive tests
5. **Documentation**: Update API docs

### Testing
```bash
# Manual testing
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+919876543210","password":"Test123!","role":"customer"}'

# Health check
curl http://localhost:3000/api/health
```

## 🌐 Production Deployment

### Environment Setup
- Set `NODE_ENV=production`
- Use strong secrets and secure database
- Enable HTTPS with SSL certificates
- Configure reverse proxy (Nginx)
- Set up monitoring and logging

### Recommended Architecture
```
Internet → Nginx (SSL) → Node.js App → MongoDB
                      ↓
                Cloud Storage (Documents)
                      ↓
                External APIs (Twilio, Google)
```

## 📈 Monitoring & Maintenance

### Health Checks
- **API Health**: `GET /api/health`
- **Database**: Connection status monitoring
- **External Services**: Twilio/Google API status
- **File Storage**: Upload directory monitoring

### Logging
- Authentication events
- Failed login attempts
- API rate limit violations
- Error tracking and reporting

### Backup Strategy
- Daily MongoDB backups
- Document file backups
- Environment configuration backups
- Recovery procedures documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Use ESLint for code linting
- Follow RESTful API conventions
- Write comprehensive tests
- Document new features
- Follow security best practices

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

- **Documentation**: Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for setup issues
- **API Reference**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Authentication**: Review [AUTHENTICATION_DOCUMENTATION.md](AUTHENTICATION_DOCUMENTATION.md)

## 🎯 Roadmap

- [ ] Email verification system
- [ ] Multi-factor authentication
- [ ] Advanced analytics dashboard
- [ ] Automated document verification
- [ ] Mobile app API optimization
- [ ] Microservices architecture
- [ ] Real-time notifications
- [ ] Advanced search with Elasticsearch

---

**Built with ❤️ for the artisan community**

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Artisans
- `POST /api/artisans` - Create artisan profile
- `GET /api/artisans` - Get all artisans
- `GET /api/artisans/:id` - Get artisan by ID
- `PUT /api/artisans/:id` - Update artisan
- `DELETE /api/artisans/:id` - Delete artisan
- `POST /api/artisans/:id/skills` - Add skill
- `DELETE /api/artisans/:id/skills` - Remove skill

### Distributors
- `POST /api/distributors` - Create distributor profile
- `GET /api/distributors` - Get all distributors
- `GET /api/distributors/:id` - Get distributor by ID
- `PUT /api/distributors/:id` - Update distributor
- `DELETE /api/distributors/:id` - Delete distributor

### Products
- `POST /api/products` - Create product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/artisan/:artisanId` - Get products by artisan
- `PATCH /api/products/:id/stock` - Update product stock

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/buyer/:buyerId` - Get orders by buyer
- `GET /api/orders/artisan/:artisanId` - Get orders by artisan
- `PATCH /api/orders/:id/status` - Update order status

### Raw Material Orders
- `POST /api/raw-material-orders` - Create raw material order
- `GET /api/raw-material-orders` - Get all raw material orders
- `GET /api/raw-material-orders/:id` - Get raw material order by ID
- `PUT /api/raw-material-orders/:id` - Update raw material order
- `DELETE /api/raw-material-orders/:id` - Delete raw material order

### Materials
- `POST /api/materials` - Create material
- `GET /api/materials` - Get all materials
- `GET /api/materials/:id` - Get material by ID
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/materials/category/:category` - Get materials by category
- `PATCH /api/materials/:id/stock` - Update material stock

### Inventory
- `POST /api/inventory` - Create inventory
- `GET /api/inventory` - Get all inventories
- `GET /api/inventory/:id` - Get inventory by ID
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory
- `GET /api/inventory/artisan/:artisanId` - Get inventory by artisan
- `POST /api/inventory/:id/products` - Add product to inventory
- `POST /api/inventory/:id/raw-materials` - Add raw material to inventory

## Data Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  role: String (enum: ['artisan', 'customer', 'distributor', 'admin']),
  phone: String,
  address: Object,
  isVerified: Boolean
}
```

### Artisan Profile
```javascript
{
  userId: ObjectId (ref: User),
  bio: String,
  region: String (required),
  skills: [String],
  bankDetails: Object
}
```

### Product
```javascript
{
  name: String (required),
  description: String (required),
  category: String (required),
  artisanId: ObjectId (ref: User),
  price: Number (required),
  stock: Number (required),
  images: [String],
  status: String (enum: ['active', 'out_of_stock', 'discontinued'])
}
```

### Order
```javascript
{
  orderNumber: String (required, unique),
  buyerId: ObjectId (ref: User),
  artisanId: ObjectId (ref: User),
  items: [OrderItem],
  totalAmount: Number (required),
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: Object,
  paymentStatus: String (enum: ['pending', 'completed', 'failed'])
}
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/artisan_management
```

## Error Handling

The API uses consistent error response format:

```javascript
{
  success: false,
  message: "Error description"
}
```

## Success Response

Successful responses follow this format:

```javascript
{
  success: true,
  message: "Success message",
  data: {} // Response data
}
```

## Development

1. Install nodemon for development:
```bash
npm install -g nodemon
```

2. Run in development mode:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License