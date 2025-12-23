# Sinmail Backend

> **Note**: The backend is now implemented as Next.js API routes in the `frontend/` directory for unified deployment.

## Implementation Status

The x402 payment backend has been implemented in `frontend/app/api/` with the following endpoints:

### API Endpoints

| Endpoint                           | Method           | Description                        |
| ---------------------------------- | ---------------- | ---------------------------------- |
| `/api/preflight`                   | POST             | Check allowlist status + get price |
| `/api/messages`                    | POST             | Submit message (x402 protected)    |
| `/api/recipients`                  | GET/POST         | List/create recipients             |
| `/api/recipients/[slug]`           | GET/PATCH/DELETE | Recipient CRUD                     |
| `/api/recipients/[slug]/allowlist` | GET/POST/DELETE  | Manage allowlist                   |
| `/api/x402/session-token`          | POST             | x402 onramp session                |

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Payments**: x402-next, @coinbase/x402
- **Database**: PostgreSQL + Prisma
- **Validation**: Zod

### Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and PLATFORM_WALLET_ADDRESS

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sinmail"

# x402 / Coinbase
PLATFORM_WALLET_ADDRESS="0x..."  # Your Ethereum address to receive payments
NETWORK="base-sepolia"           # or "base" for mainnet
CDP_CLIENT_KEY=""                # Optional, for Coinbase onramp
```

### x402 Payment Flow

1. Sender calls `POST /api/preflight` to check if allowlisted
2. If not allowlisted, sender calls `POST /api/messages` without payment
3. Server returns 402 with payment requirements
4. Sender signs EIP-3009 authorization with their wallet
5. Sender retries `POST /api/messages` with `X-PAYMENT` header
6. Server verifies with Coinbase facilitator
7. Payment settles on-chain (Base network)
8. Message queued for Gmail delivery

### Files Structure

```
frontend/
├── app/api/              # API routes
├── lib/
│   ├── db/prisma.ts      # Database client
│   ├── schemas/          # Zod validation schemas
│   ├── x402/             # Payment utilities
│   └── delivery/         # Gmail delivery (stubbed)
├── middleware.ts         # x402 middleware
└── prisma/
    ├── schema.prisma     # Database models
    └── seed.ts           # Sample data
```

## Future Work

- [ ] Gmail OAuth integration for delivery
- [ ] BullMQ queue for async delivery
- [ ] Recipient dashboard authentication
- [ ] Payment analytics
- [ ] Rate limiting and abuse prevention
