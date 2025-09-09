'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import NextImage from 'next/image';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Users,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  UserCog,
  X,
  Upload,
  Image,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';

interface MedicalStaff {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string;
  user_updated: string;
  name?: string;
  surname?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  type?: string;
  position?: string;
  department?: string;
  license_number?: string;
  qualification?: string;
  address?: string;
  signature?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function MedicalStaffPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='p-6'>
          <h1 className='text-2xl font-bold'>Medical Staff</h1>
          <p className='text-muted-foreground'>Doctors and nurses management</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
