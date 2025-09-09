'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';
import { useRouteState } from '@/hooks/useRouteState';
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
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  User,
  Heart,
  Shield,
  Pill,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';

interface MedicalHistory {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string | null;
  user_updated: string | null;
  employee_id: string;
  conditions_header: string | null;
  hiv: string | null;
  high_blood_pressure: boolean;
  high_cholesterol: boolean;
  diabetes: boolean;
  thyroid_disease: boolean;
  asthma: boolean;
  epilepsy: boolean;
  bipolar_mood_disorder: boolean;
  anxiety_or_depression: boolean;
  inflammatory_bowel_disease: boolean;
  tb: boolean;
  hepatitis: boolean;
  other: string | null;
  notes: string | null;
  disability_header: string | null;
  disability: boolean;
  disability_type: string | null;
  disabilty_desription: string | null;
  allergies_header: string | null;
  medication: boolean;
  medication_type: string | null;
  medication_severity: string | null;
  environmental: boolean;
  environmental_type: string | null;
  enviromental_severity: string | null;
  food: boolean;
  food_type: string | null;
  food_severity: string | null;
  on_medication: boolean;
  chronic_medication: string | null;
  vitamins_or_supplements: string | null;
  family_history_header: string | null;
  family_conditions: string | null;
  heart_attack: boolean;
  heart_attack_60: string | null;
  cancer_family: boolean;
  type_cancer: string | null;
  age_of_cancer: string | null;
  family_members: string | null;
  other_family: string | null;
  surgery_header: string | null;
  surgery: boolean;
  surgery_type: string | null;
  surgery_year: string | null;
  notes_header: string | null;
  notes_text: string | null;
  recommendation_text: string | null;
  employee_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface Employee {
  id: string;
  name: string;
  surname: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function MedicalHistoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='p-6'>
          <h1 className='text-2xl font-bold'>Medical History</h1>
          <p className='text-muted-foreground'>
            Employee medical history records
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
