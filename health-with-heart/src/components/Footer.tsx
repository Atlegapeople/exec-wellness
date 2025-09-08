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
  Calendar,
  BarChart3,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className='border-t w-full flex-shrink-0'
      style={{ backgroundColor: '#178089' }}
    >
      <div className='px-4 sm:px-6 lg:px-8 xl:px-12'>
        {/* Main Footer Content */}
        <div className='py-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Company Info */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <img
                  src='/footer-logo-health-with-heart-logo-2.svg'
                  alt='Health With Heart'
                  className='h-32 w-auto'
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className='space-y-4'>
              <h3
                className='font-semibold flex items-center gap-2'
                style={{ color: '#FFFFFF' }}
              >
                <MapPin className='h-4 w-4' style={{ color: '#FFFFFF' }} />
                Contact Details
              </h3>
              <div className='space-y-3 text-sm'>
                <div className='flex items-start gap-2'>
                  <MapPin
                    className='h-4 w-4 mt-0.5 flex-shrink-0'
                    style={{ color: '#FFFFFF' }}
                  />
                  <div style={{ color: '#FFFFFF' }}>
                    <div>Ground floor, 8 Merchant Place</div>
                    <div>1 Fredman Drive, Sandton 2196</div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4' style={{ color: '#FFFFFF' }} />
                  <a
                    href='tel:+27116855021'
                    className='transition-colors'
                    style={{ color: '#FFFFFF' }}
                  >
                    +27 (0)11 685 5021
                  </a>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4' style={{ color: '#FFFFFF' }} />
                  <a
                    href='tel:+27792628749'
                    className='transition-colors'
                    style={{ color: '#FFFFFF' }}
                  >
                    +27 (0)79 262 8749
                  </a>
                </div>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' style={{ color: '#FFFFFF' }} />
                  <a
                    href='mailto:staywell@healthwithheart.co.za'
                    className='transition-colors break-all'
                    style={{ color: '#FFFFFF' }}
                  >
                    staywell@healthwithheart.co.za
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className='space-y-4'>
              <h3
                className='font-semibold flex items-center gap-2'
                style={{ color: '#FFFFFF' }}
              >
                <Users className='h-4 w-4' style={{ color: '#FFFFFF' }} />
                Quick Links
              </h3>
              <div className='space-y-3'>
                <a
                  href='/employees'
                  className='group flex items-center gap-2 text-sm text-white hover:text-[#EAB75C] hover:bg-white/10 rounded-md px-2 py-1 transition-colors'
                >
                  <Users className='h-3 w-3 text-white group-hover:text-[#EAB75C] transition-colors' />
                  Employee Management
                </a>
                <a
                  href='/reports'
                  className='group flex items-center gap-2 text-sm text-white hover:text-[#EAB75C] hover:bg-white/10 rounded-md px-2 py-1 transition-colors'
                >
                  <FileText className='h-3 w-3 text-white group-hover:text-[#EAB75C] transition-colors' />
                  Medical Reports
                </a>
                <a
                  href='/appointments'
                  className='group flex items-center gap-2 text-sm text-white hover:text-[#EAB75C] hover:bg-white/10 rounded-md px-2 py-1 transition-colors'
                >
                  <Calendar className='h-3 w-3 text-white group-hover:text-[#EAB75C] transition-colors' />
                  Appointments
                </a>
                <a
                  href='/analytics'
                  className='group flex items-center gap-2 text-sm text-white hover:text-[#EAB75C] hover:bg-white/10 rounded-md px-2 py-1 transition-colors'
                >
                  <BarChart3 className='h-3 w-3 text-white group-hover:text-[#EAB75C] transition-colors' />
                  Health Analytics
                </a>
              </div>
            </div>

            {/* Services */}
            <div className='space-y-4'>
              <h3
                className='font-semibold flex items-center gap-2'
                style={{ color: '#FFFFFF' }}
              >
                <Stethoscope className='h-4 w-4' style={{ color: '#FFFFFF' }} />
                Our Services
              </h3>
              <ul className='space-y-2 text-sm' style={{ color: '#FFFFFF' }}>
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
        <Separator style={{ backgroundColor: '#B4CABC' }} />
        <div className='py-6'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <div className='text-sm' style={{ color: '#FFFFFF' }}>
              © {currentYear} Health With Heart. All rights reserved.
            </div>
            <div className='flex items-center gap-6 text-sm'>
              <Button
                variant='ghost'
                size='sm'
                className='p-0'
                style={{ color: '#FFFFFF' }}
              >
                Privacy Policy
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='p-0'
                style={{ color: '#FFFFFF' }}
              >
                Terms of Service
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='p-0'
                style={{ color: '#FFFFFF' }}
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
