# PostgreSQL to Supabase Migration Guide
## OHMS Health Management System

---

## 📋 **Project Understanding & Database Schema**

### **Project Overview**
Your OHMS (Occupational Health Management System) is a comprehensive medical platform that:
- Manages executive medical reports and appointments
- Handles patient data with POPIA compliance
- Tracks clinical records and medical outcomes
- Integrates with Xero for billing
- Provides role-based access control for medical staff

### **Current Database Schema Analysis**

Your PostgreSQL database has a sophisticated structure with the following components:

#### **🔐 Core Tables**
1. **`users`** - User accounts with role-based access (admin, doctor, nurse, patient)
2. **`clinics`** - Multi-clinic support system
3. **`patients`** - Patient records with POPIA compliance
4. **`appointments`** - Medical appointment scheduling
5. **`clinical_records`** - Vitals, history, and examination data
6. **`medical_reports`** - Final medical reports with workflow tracking
7. **`audit_logs`** - Comprehensive audit trail for compliance
8. **`invoices`** - Billing with Xero integration
9. **`invoice_line_items`** - Detailed billing breakdown

#### **🎯 Key Features**
- **Row Level Security (RLS)** policies for data protection
- **UUID-based** primary keys for scalability
- **Comprehensive indexing** for performance
- **Audit triggers** for compliance tracking
- **Custom functions** for BMI calculation, invoice generation
- **Views** for dashboard analytics
- **POPIA compliance** with consent tracking

#### **🔧 Technical Specifications**
- **Extensions**: `uuid-ossp`, `pgcrypto`
- **Data Types**: UUID, JSONB, Arrays, ENUMs
- **Constraints**: Data validation and business rules
- **Triggers**: Automatic timestamp updates and audit logging
- **Functions**: Custom PostgreSQL functions for business logic

---

## 🚀 **Migration Strategy: PostgreSQL → Supabase**

### **Why Supabase?**
- **Built-in Authentication**: Integrated auth system with RLS
- **Real-time Features**: Live data updates for dashboards
- **Edge Functions**: Serverless backend logic
- **Storage**: Built-in file storage for PDFs
- **Dashboard**: Built-in database management
- **Scalability**: Managed PostgreSQL with auto-scaling

### **Migration Approach**
We'll use a **phased migration** approach to minimize downtime and ensure data integrity.

---

## 📋 **Migration Steps Breakdown**

### **Phase 1: Pre-Migration Setup (1-2 days)**

#### **Step 1.1: Supabase Project Setup**
```bash
# 1. Create Supabase account at https://supabase.com
# 2. Create new project
# 3. Note down your project URL and API keys
```

#### **Step 1.2: Environment Preparation**
```bash
# Install required tools
npm install -g supabase-cli
pip install psycopg2-binary supabase pandas python-dotenv
```

#### **Step 1.3: Database Backup**
```bash
# Create full backup of current PostgreSQL database
# For Unix/Linux/macOS:
pg_dump -h localhost -U your_username -d ohms_database > ohms_backup_$(date +%Y%m%d).sql

# For Windows PowerShell:
pg_dump -h localhost -U your_username -d ohms_database > ohms_backup_$(Get-Date -Format "yyyyMMdd").sql

# Verify backup integrity
psql -h localhost -U your_username -d ohms_database -c "SELECT COUNT(*) FROM users;"
```

#### **Step 1.4: Schema Analysis**
```bash
# Export current schema
pg_dump -h localhost -U your_username -d ohms_database --schema-only > current_schema.sql

# Export data statistics
psql -h localhost -U your_username -d ohms_database -c "
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;
"
```

---

### **Phase 2: Schema Migration (2-3 days)**

#### **Step 2.1: Create Supabase Schema**
```sql
-- Run in Supabase SQL Editor
-- This creates the foundation structure

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'patient');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE report_status AS ENUM ('draft', 'pending_review', 'signed', 'locked', 'archived');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled', 'refunded');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
```

#### **Step 2.2: Create Tables**
```sql
-- Create tables in dependency order
-- 1. Users table (extends Supabase auth.users)
-- 2. Clinics table
-- 3. User-clinics relationships
-- 4. Patients table
-- 5. Appointments table
-- 6. Clinical records table
-- 7. Medical reports table
-- 8. Audit logs table
-- 9. Invoices table
-- 10. Invoice line items table
```

#### **Step 2.3: Create Indexes**
```sql
-- Create all performance indexes
-- This ensures query performance in Supabase
```

#### **Step 2.4: Create Functions**
```sql
-- Migrate custom functions:
-- - update_updated_at_column()
-- - calculate_bmi()
-- - generate_invoice_number()
-- - log_audit_trail()
-- - generate_invoice_on_signoff()
```

#### **Step 2.5: Create Triggers**
```sql
-- Set up all triggers for:
-- - Timestamp updates
-- - Audit logging
-- - Auto-invoice generation
```

---

### **Phase 3: Data Migration (1-2 days)**

#### **Step 3.1: Data Export Script**
```python
# Create Python script for data extraction
import psycopg2
import pandas as pd
from supabase import create_client
import json

def export_data():
    # Connect to local PostgreSQL
    local_conn = psycopg2.connect(
        host="localhost",
        database="ohms_database",
        user="your_username",
        password="your_password"
    )
    
    # Extract data in dependency order
    tables = [
        'clinics',
        'users', 
        'user_clinics',
        'patients',
        'appointments',
        'clinical_records',
        'medical_reports',
        'audit_logs',
        'invoices',
        'invoice_line_items'
    ]
    
    for table in tables:
        df = pd.read_sql(f"SELECT * FROM {table}", local_conn)
        df.to_csv(f"export_{table}.csv", index=False)
        print(f"Exported {table}: {len(df)} rows")
    
    local_conn.close()
```

#### **Step 3.2: Data Import Script**
```python
# Create Python script for data import
def import_data():
    # Connect to Supabase
    supabase = create_client(
        "https://your-project.supabase.co",
        "your-service-role-key"
    )
    
    # Import data in dependency order
    for table in tables:
        df = pd.read_csv(f"export_{table}.csv")
        
        # Handle data type conversions
        if 'id' in df.columns:
            df['id'] = df['id'].astype(str)
        
        # Import to Supabase
        for _, row in df.iterrows():
            try:
                supabase.table(table).insert(row.to_dict()).execute()
            except Exception as e:
                print(f"Error importing {table}: {e}")
        
        print(f"Imported {table}: {len(df)} rows")
```

#### **Step 3.3: Data Validation**
```sql
-- Verify data integrity in Supabase
SELECT 
    'users' as table_name,
    COUNT(*) as row_count
FROM users
UNION ALL
SELECT 
    'patients' as table_name,
    COUNT(*) as row_count
FROM patients
UNION ALL
SELECT 
    'appointments' as table_name,
    COUNT(*) as row_count
FROM appointments;
-- Continue for all tables
```

---

### **Phase 4: Security & RLS Setup (1 day)**

#### **Step 4.1: Enable RLS**
```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
-- Continue for all tables
```

#### **Step 4.2: Create RLS Policies**
```sql
-- Create comprehensive security policies
-- This ensures data protection in Supabase
```

#### **Step 4.3: Test Security**
```sql
-- Test RLS policies with different user roles
-- Verify data access restrictions work correctly
```

---

### **Phase 5: Application Integration (2-3 days)**

#### **Step 5.1: Update Environment Variables**
```bash
# Update your .env file
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### **Step 5.2: Update Database Connection**
```typescript
// Update src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### **Step 5.3: Update API Routes**
```typescript
// Update all API routes to use Supabase
// Example: src/app/api/employees/route.ts
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'doctor')
  
  if (error) throw error
  return Response.json(data)
}
```

---

### **Phase 6: Testing & Validation (2-3 days)**

#### **Step 6.1: Functional Testing**
- [ ] User authentication works
- [ ] Data CRUD operations function
- [ ] RLS policies enforce access control
- [ ] Charts and analytics display correctly
- [ ] PDF generation works
- [ ] Email notifications function

#### **Step 6.2: Performance Testing**
```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM medical_reports WHERE status = 'signed';
EXPLAIN ANALYZE SELECT * FROM appointments WHERE appointment_date >= CURRENT_DATE;
```

#### **Step 6.3: Security Testing**
- [ ] Test RLS policies with different user roles
- [ ] Verify audit logging works
- [ ] Test data isolation between clinics

---

### **Phase 7: Go-Live & Monitoring (1 day)**

#### **Step 7.1: DNS Update**
```bash
# Update your domain to point to Supabase
# Or keep local for testing and gradually migrate
```

#### **Step 7.2: Monitor Performance**
```sql
-- Set up monitoring queries
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
```

#### **Step 7.3: Backup Strategy**
```bash
# Set up automated backups in Supabase
# Configure retention policies
```

---

## 🛠️ **Migration Tools & Scripts**

### **Automated Migration Script**
```python
#!/usr/bin/env python3
"""
OHMS Database Migration Script
PostgreSQL → Supabase
"""

import os
import psycopg2
import pandas as pd
from supabase import create_client
from dotenv import load_dotenv
import logging
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OHMSMigrator:
    def __init__(self):
        # Local PostgreSQL connection
        self.local_conn = psycopg2.connect(
            host=os.getenv('LOCAL_DB_HOST'),
            database=os.getenv('LOCAL_DB_NAME'),
            user=os.getenv('LOCAL_DB_USER'),
            password=os.getenv('LOCAL_DB_PASSWORD')
        )
        
        # Supabase connection
        self.supabase = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        # Migration order (respects dependencies)
        self.migration_order = [
            'clinics',
            'users',
            'user_clinics', 
            'patients',
            'appointments',
            'clinical_records',
            'medical_reports',
            'audit_logs',
            'invoices',
            'invoice_line_items'
        ]
    
    def export_table(self, table_name):
        """Export table data from local PostgreSQL"""
        try:
            query = f"SELECT * FROM {table_name}"
            df = pd.read_sql(query, self.local_conn)
            
            # Save to CSV
            filename = f"export_{table_name}_{int(time.time())}.csv"
            df.to_csv(filename, index=False)
            
            logger.info(f"Exported {table_name}: {len(df)} rows to {filename}")
            return df
            
        except Exception as e:
            logger.error(f"Error exporting {table_name}: {e}")
            return None
    
    def import_table(self, table_name, df):
        """Import table data to Supabase"""
        try:
            # Convert DataFrame to list of dictionaries
            records = df.to_dict('records')
            
            # Handle UUID conversion
            for record in records:
                if 'id' in record and record['id']:
                    record['id'] = str(record['id'])
            
            # Import in batches
            batch_size = 100
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                
                result = self.supabase.table(table_name).insert(batch).execute()
                
                if result.data:
                    logger.info(f"Imported batch {i//batch_size + 1} for {table_name}")
                else:
                    logger.error(f"Failed to import batch for {table_name}")
            
            logger.info(f"Successfully imported {table_name}: {len(records)} rows")
            
        except Exception as e:
            logger.error(f"Error importing {table_name}: {e}")
    
    def migrate_all(self):
        """Execute complete migration"""
        logger.info("Starting OHMS database migration...")
        
        for table in self.migration_order:
            logger.info(f"Migrating {table}...")
            
            # Export from local
            df = self.export_table(table)
            if df is not None and not df.empty:
                # Import to Supabase
                self.import_table(table, df)
            
            # Small delay between tables
            time.sleep(1)
        
        logger.info("Migration completed!")
    
    def cleanup(self):
        """Clean up connections and temporary files"""
        self.local_conn.close()
        
        # Remove temporary CSV files
        import glob
        for file in glob.glob("export_*.csv"):
            os.remove(file)
            logger.info(f"Removed temporary file: {file}")

if __name__ == "__main__":
    migrator = OHMSMigrator()
    try:
        migrator.migrate_all()
    finally:
        migrator.cleanup()
```

---

## 📊 **Migration Checklist**

### **Pre-Migration**
- [ ] Create Supabase project
- [ ] Backup local database
- [ ] Document current schema
- [ ] Set up development environment
- [ ] Test migration scripts

### **Schema Migration**
- [ ] Create ENUM types
- [ ] Create all tables
- [ ] Create indexes
- [ ] Create functions
- [ ] Create triggers
- [ ] Create views

### **Data Migration**
- [ ] Export local data
- [ ] Import to Supabase
- [ ] Validate data integrity
- [ ] Test data relationships

### **Security Setup**
- [ ] Enable RLS on all tables
- [ ] Create RLS policies
- [ ] Test access control
- [ ] Verify audit logging

### **Application Integration**
- [ ] Update environment variables
- [ ] Update database connections
- [ ] Update API routes
- [ ] Test all functionality

### **Go-Live**
- [ ] Final data validation
- [ ] Performance testing
- [ ] Security testing
- [ ] Update DNS (if applicable)
- [ ] Monitor system

---

## ⚠️ **Important Considerations**

### **Data Types**
- **UUIDs**: Ensure proper conversion from local to Supabase
- **JSONB**: Verify JSON data integrity
- **Arrays**: Check array data migration
- **Timestamps**: Handle timezone conversions

### **Performance**
- **Indexes**: Recreate all performance indexes
- **Queries**: Test query performance in Supabase
- **Connections**: Monitor connection pooling

### **Security**
- **RLS Policies**: Thoroughly test all security policies
- **API Keys**: Secure all Supabase API keys
- **Audit Logging**: Verify audit trail functionality

### **Backup Strategy**
- **Local Backup**: Keep local database backup for 30 days
- **Supabase Backups**: Enable automated Supabase backups
- **Rollback Plan**: Have rollback strategy ready

---

## 🎯 **Expected Timeline**

- **Total Migration Time**: 10-15 days
- **Downtime**: Minimal (can be done during maintenance window)
- **Risk Level**: Medium (mitigated by phased approach)

---

## 📞 **Support & Resources**

### **Documentation**
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL to Supabase Migration Guide](https://supabase.com/docs/guides/migrations)
- [RLS Policy Examples](https://supabase.com/docs/guides/auth/row-level-security)

### **Community**
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

## 🚀 **Next Steps**

1. **Review this guide** and identify any questions
2. **Set up Supabase project** and get API keys
3. **Create migration scripts** based on your specific setup
4. **Test migration** in development environment
5. **Execute migration** following the phased approach
6. **Monitor and validate** the migrated system

---

*This migration guide is specifically tailored for your OHMS Health Management System. For any questions or clarifications, please refer to the Supabase documentation or reach out to the community.*
