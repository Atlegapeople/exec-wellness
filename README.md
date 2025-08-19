# Health With Heart - Executive Medical Report Platform

A unified, modern, secure, and cost-efficient web application for executive medical bookings, clinical data entry, report generation, and billing.

## 🏥 Project Overview

**Health With Heart** is replacing the current fragmented system (Amelia, AppSheet, Tableau, Zapier, Xero integration) with an integrated platform that handles the entire executive medical examination workflow:

**Booking → Clinical Data → PDF Report → Sign-off → Billing**

## ✨ Features

- **Unified System**: Single platform for all medical operations
- **Role-Based Access**: Admin, Doctor, Nurse, and Patient roles
- **Clinical Interface**: Easy data capture with character limits and real-time PDF preview
- **Security**: POPIA-compliant with encryption, RLS, and audit trails
- **Integration**: Automated Xero billing and comprehensive reporting
- **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide React icons
- **Forms**: React Hook Form, Zod validation
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **PDF Generation**: Puppeteer (server-side)
- **Charts**: Recharts for data visualization
- **Testing**: Jest, Playwright (E2E)
- **Animation**: Framer Motion

## 📋 Prerequisites

- Node.js 18.18.0+ (use `.nvmrc`)
- npm 9.0.0+
- Supabase account and project
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/health-with-heart.git
cd health-with-heart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Xero Integration (Optional)
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_TENANT_ID=your_xero_tenant_id

# PDF Generation
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### 4. Database Setup

1. **Deploy the database schema**:
   ```bash
   npm run db:push
   ```

2. **Generate TypeScript types**:
   ```bash
   npm run db:generate
   ```

3. **Open Supabase Studio** (optional):
   ```bash
   npm run db:studio
   ```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client & server
│   ├── utils.ts          # Common utilities
│   └── validations.ts    # Zod schemas
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── __tests__/            # Test files
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Medical Records

- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/reports` - List medical reports
- `POST /api/reports` - Create medical report

### PDF Generation

- `POST /api/pdf/generate` - Generate PDF report
- `GET /api/pdf/:id` - Download PDF report

## 🔒 Security Features

- **POPIA Compliance**: South African data protection standards
- **Row-Level Security (RLS)**: Database-level access control
- **Encryption**: Data encrypted at rest and in transit
- **Audit Trails**: Comprehensive logging of all actions
- **Role-Based Access**: Granular permissions per user role
- **Signed URLs**: Secure file access with expiration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Follow the existing code style and structure

## 📝 License

This project is proprietary software for Health With Heart. All rights reserved.

## 🆘 Support

For support and questions:

- **Technical Issues**: Create an issue in this repository
- **Business Questions**: Contact Health With Heart directly
- **Documentation**: Check the [Wiki](../../wiki) for detailed guides

## 🔄 Changelog

### v0.1.0 (Current)
- Initial project setup
- Basic authentication system
- Database schema implementation
- Core project structure

## 📊 Performance Metrics

- **Target API Latency**: <300ms
- **PDF Generation**: <2s
- **Uptime**: 99.9%
- **Page Load**: <3s (First Contentful Paint)

## 🏗️ Architecture Decisions

- **Next.js App Router**: Modern React patterns and better performance
- **Supabase**: Rapid development with built-in security
- **Tailwind CSS**: Utility-first CSS for consistent design
- **shadcn/ui**: Accessible, customizable component library
- **Puppeteer**: Server-side PDF generation for security

---

**Built with ❤️ for Health With Heart**
