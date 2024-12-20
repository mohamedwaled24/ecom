# E-Commerce RESTful API

## Description
This is a RESTful API for an e-commerce platform that provides functionalities such as user authentication, product management, and order processing. The API is built using Node.js and Express, leveraging JWT for authentication and Redis for session management.

## Features
- **User Authentication**: 
  - JWT-based authentication with access and refresh tokens.
  - Refresh tokens are stored in cookies and managed in Redis.

- **Product Management**:
  - CRUD operations for products.
  - Ability to mark products as featured or recommended.

- **Coupon System**:
  - Create and manage coupons for discounts on future purchases.

- **Admin Dashboard**:
  - Analytics for products, users, sales, and revenue.
  - Overview of orders made.

- **Payment Integration**:
  - Integration with Stripe to create payment sessions for processing transactions.

## Getting Started

### Prerequisites
- Node.js
- JWT
- Cloudinary
- npm (Node Package Manager)
- Redis
- Stripe account

### Installation
1. Clone the repository:
   
bash
   git clone https://github.com/yourusername/repositoryname.git
   cd repositoryname
  

2. Install dependencies:
   
bash
   npm install
  

3. Set up environment variables:
   - Create a `.env` file in the root of the project and add your configurations:
     
     PORT=your_port
     JWT_SECRET=your_jwt_secret
     REDIS_URL=your_redis_url
     STRIPE_SECRET_KEY=your_stripe_secret_key
     CLOUDINARY_CLOUD_NAME = your_cloudinary_name
     CLOUDINARY_API_KEY = your_cloudinary_api_key
     CLOUDINARY_SECRET_KEY = your_cloudinary_secret_api_key
     MONGO_URI = your_mongodb_config
     node_dev = development || production (mode)    

### Running the Application
To start the server, run:
bash
npm start
The server should now be running on `http://localhost:your_port`.

### API Endpoints
- **Authentication**:
  - `POST /api/auth/login`: Login and receive access and refresh tokens.
  - `POST /api/auth/signup`: Signup and receive access and refresh tokens
  - `POST /api/auth/logout`: Logout and delete access and refresh tokens
  - `GET /api/auth/get-profie`: get-profile and get user informations .
  - `POST /api/auth/refresh`: Refresh access token using a refresh token.

- **Products**:
  - `GET /api/products`: Retrieve all products.
  - `POST /api/products`: Create a new product.
  - `PUT /api/products/:id`: Update an existing product.
  - `DELETE /api/products/:id`: Delete a product.
  - `get /api/products/featured`: Get Featured Products
  - `get /api/products/recommendations`: Get Reommended Products.
  - `get /api/products/catgeory`: get products by category.

- **Coupons**:
  - `GET /api/coupons`: Get your coupons.
  - `POST /api/coupons` Check Validation Of Your coupons.

- **Admin Dashboard**:
  - `GET /api/analytics`: Retrieve analytics data.

- **Payments**:
  - `POST /api/payments/create-checkout-session`: Create a payment session with Stripe.
  - `POST /api/payments/checkout-success`: Check the success of the payment.

- **Cart**:
  - `GET /api/cart`: Retrieve all cart items.
  - `POST /api/cart`: Add to cart.
  - `PUT /api/cart/:id`: Update an existing cart.
  - `DELETE /api/cart/`: Delete a cart.

## Contributing
Feel free to submit issues or pull requests to improve the project.
