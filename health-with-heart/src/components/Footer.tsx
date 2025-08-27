'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  Shield,
  Users,
  FileText,
  Stethoscope,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-card border-t mt-auto'>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24'>
        {/* Main Footer Content */}
        <div className='py-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {/* Company Info */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <img
                  src='/Logo-Health-With-Heart-Logo-Registered.svg'
                  alt='Health With Heart'
                  className='h-12 w-auto'
                />
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Comprehensive occupational health management system providing
                professional medical services and health monitoring solutions.
              </p>
              <div className='flex items-center gap-2'>
                <Heart className='h-4 w-4 text-red-500' />
                <span className='text-sm text-muted-foreground'>
                  Caring for workplace wellness
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-foreground flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-primary' />
                Contact Details
              </h3>
              <div className='space-y-3 text-sm'>
                <div className='flex items-start gap-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                  <div className='text-muted-foreground'>
                    <div>Ground floor, 8 Merchant Place</div>
                    <div>1 Fredman Drive, Sandton 2196</div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <a
                    href='tel:+27116855021'
                    className='text-muted-foreground hover:text-primary transition-colors'
                  >
                    +27 (0)11 685 5021
                  </a>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <a
                    href='tel:+27792628749'
                    className='text-muted-foreground hover:text-primary transition-colors'
                  >
                    +27 (0)79 262 8749
                  </a>
                </div>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <a
                    href='mailto:staywell@healthwithheart.co.za'
                    className='text-muted-foreground hover:text-primary transition-colors break-all'
                  >
                    staywell@healthwithheart.co.za
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-foreground flex items-center gap-2'>
                <Users className='h-4 w-4 text-primary' />
                Quick Links
              </h3>
              <div className='flex flex-col space-y-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='justify-start p-0 h-auto text-sm w-full'
                  asChild
                >
                  <a
                    href='/employees'
                    className='flex items-center gap-2 w-full'
                  >
                    <Users className='h-3 w-3' />
                    Employee Management
                  </a>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='justify-start p-0 h-auto text-sm w-full'
                  asChild
                >
                  <a href='/reports' className='flex items-center gap-2 w-full'>
                    <FileText className='h-3 w-3' />
                    Medical Reports
                  </a>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='justify-start p-0 h-auto text-sm w-full'
                  asChild
                >
                  <a
                    href='/appointments'
                    className='flex items-center gap-2 w-full'
                  >
                    <Stethoscope className='h-3 w-3' />
                    Appointments
                  </a>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='justify-start p-0 h-auto text-sm w-full'
                  asChild
                >
                  <a
                    href='/analytics'
                    className='flex items-center gap-2 w-full'
                  >
                    <Shield className='h-3 w-3' />
                    Health Analytics
                  </a>
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-foreground flex items-center gap-2'>
                <Stethoscope className='h-4 w-4 text-primary' />
                Our Services
              </h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>• Executive Medical Assessments</li>
                <li>• Occupational Health Screening</li>
                <li>• Workplace Wellness Programs</li>
                <li>• Health Risk Assessments</li>
                <li>• Medical Surveillance</li>
                <li>• Fitness for Duty Evaluations</li>
                <li>• Health Data Analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <Separator />
        <div className='py-6'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <div className='text-sm text-muted-foreground'>
              © {currentYear} Health With Heart. All rights reserved.
            </div>
            <div className='flex items-center gap-6 text-sm'>
              <Button
                variant='ghost'
                size='sm'
                className='text-muted-foreground hover:text-primary p-0'
              >
                Privacy Policy
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='text-muted-foreground hover:text-primary p-0'
              >
                Terms of Service
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='text-muted-foreground hover:text-primary p-0'
              >
                Data Protection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
