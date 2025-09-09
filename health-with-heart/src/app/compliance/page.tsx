'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Shield,
  Search,
  Plus,
  Send,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  FileCheck,
  Calendar,
  Mail,
  Download,
  Filter,
  RefreshCw,
  Info,
} from 'lucide-react';
import { ButtonLoading, PageLoading } from '@/components/ui/loading';

interface ConsentRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  consent_type: string;
  purpose: string;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  consent_date: string | null;
  expiry_date: string | null;
  withdrawal_date: string | null;
  legal_basis: 'consent' | 'statutory' | 'mixed';
  purpose_achieved: boolean;
  link_sent_date: string | null;
  link_opened: boolean;
  link_expires: string | null;
}

interface ConsentStats {
  total_employees: number;
  consents_active: number;
  consents_pending: number;
  consents_expired: number;
  consents_revoked: number;
  compliance_rate: number;
  expiring_soon: number;
}

const CONSENT_TYPES = [
  {
    id: 'pre_employment',
    name: 'Pre-Employment Medical Assessment',
    description: 'Medical fitness evaluation for employment',
    duration_type: 'purpose_based',
    typical_duration: 'Until hiring decision',
  },
  {
    id: 'periodic_screening',
    name: 'Periodic Health Screening',
    description: 'Regular health monitoring and assessment',
    duration_type: 'time_based',
    typical_duration: '12 months',
  },
  {
    id: 'incident_investigation',
    name: 'Incident Investigation',
    description: 'Medical data for workplace incident investigation',
    duration_type: 'purpose_based',
    typical_duration: 'Until investigation complete',
  },
  {
    id: 'return_to_work',
    name: 'Return-to-Work Assessment',
    description: 'Medical clearance for return to work',
    duration_type: 'purpose_based',
    typical_duration: 'Until clearance decision',
  },
  {
    id: 'occupational_surveillance',
    name: 'Occupational Health Surveillance',
    description: 'Ongoing health monitoring for occupational risks',
    duration_type: 'time_based',
    typical_duration: '24 months',
  },
  {
    id: 'emergency_medical',
    name: 'Emergency Medical Response',
    description: 'Emergency contact and medical information',
    duration_type: 'employment_based',
    typical_duration: 'During employment',
  },
];

export default function CompliancePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='p-6'>
          <h1 className='text-2xl font-bold'>Compliance</h1>
          <p className='text-muted-foreground'>
            Manage regulatory compliance tracking
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
