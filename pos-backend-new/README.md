# POS Backend

Express API connected to MongoDB with Mongoose.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Update `MONGO_URI` in `.env`.

For local MongoDB:

```env
MONGO_URI=mongodb://127.0.0.1:27017/pos-backend
```

For MongoDB Atlas, use the connection string from your Atlas dashboard.

4. Start the app:

```bash
npm run dev
```

The API will run at `http://localhost:5000`.

## Routes

- `GET /` - API status message
- `GET /health` - Health check
- `GET /api/products` - List products from MongoDB
- `POST /api/products` - Create a product in MongoDB

Example product request:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Tea\",\"price\":20,\"stock\":50}"
```
