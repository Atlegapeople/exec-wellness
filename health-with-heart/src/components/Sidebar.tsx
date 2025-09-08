'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CalendarDays,
  BarChart3,
  Settings,
  Stethoscope,
  Building2,
  MapPin,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Shield,
  Bell,
  ChevronLeft,
  ChevronRight,
  Heart,
  Activity,
  FileBarChart,
  UserCog,
  Database,
  TestTube2,
  AlertTriangle,
  Venus,
  Mars,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'My Dashboard',
        href: '/my-dashboard',
        icon: UserCog,
        description: 'Personal dashboard and profile',
      },
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Main dashboard overview',
      },
      {
        title: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Health analytics and insights',
      },
    ],
  },
  {
    title: 'Medical Management',
    items: [
      {
        title: 'Medical Reports',
        href: '/reports',
        icon: FileText,
        description: 'View and manage medical reports',
      },
      {
        title: 'Appointments',
        href: '/appointments',
        icon: Calendar,
        description: 'Schedule and manage appointments',
      },
      {
        title: 'Calendar',
        href: '/calendar',
        icon: CalendarDays,
        description: 'Calendar view of appointments',
      },
      {
        title: 'Vitals',
        href: '/vitals',
        icon: Heart,
        description: 'Vital signs and clinical metrics',
      },
      {
        title: 'Medical Assessments',
        href: '/assessments',
        icon: ClipboardList,
        description: 'Pre-employment and periodic assessments',
      },
      {
        title: 'Medical History',
        href: '/medical-history',
        icon: FileBarChart,
        description: 'Employee medical history records',
      },
      {
        title: 'Lifestyle',
        href: '/lifestyle',
        icon: Activity,
        description: 'Lifestyle assessments and health habits',
      },
      {
        title: "Women's Health",
        href: '/womens-health',
        icon: Venus,
        description: "Women's health assessments and services",
      },
      {
        title: "Men's Health",
        href: '/mens-health',
        icon: Mars,
        description: "Men's health assessments and services",
      },
      {
        title: 'Special Investigations',
        href: '/special-investigations',
        icon: TestTube2,
        description: 'Specialized medical tests and diagnostics',
      },
      {
        title: 'Lab Tests',
        href: '/lab-tests',
        icon: TestTube2,
        description: 'Laboratory test results and analysis',
      },
      {
        title: 'Emergency Responses',
        href: '/emergency-responses',
        icon: AlertTriangle,
        description: 'Emergency response records and incident reports',
      },
    ],
  },
  {
    title: 'Personnel',
    items: [
      {
        title: 'Employees',
        href: '/employees',
        icon: Users,
        description: 'Employee records and information',
      },
      {
        title: 'Users',
        href: '/users',
        icon: Users,
        description: 'System users and accounts',
      },
      {
        title: 'Managers',
        href: '/managers',
        icon: UserCheck,
        description: 'Manager and supervisor records',
      },
      {
        title: 'Medical Staff',
        href: '/medical-staff',
        icon: Stethoscope,
        description: 'Doctors and nurses management',
      },
    ],
  },
  {
    title: 'Organization',
    items: [
      {
        title: 'Organizations',
        href: '/organizations',
        icon: Building2,
        description: 'Manage client organizations',
      },
      {
        title: 'Sites',
        href: '/sites',
        icon: MapPin,
        description: 'Site locations and workplaces',
      },
      {
        title: 'Locations',
        href: '/locations',
        icon: MapPin,
        description: 'Specific locations within sites',
      },
      {
        title: 'Cost Centers',
        href: '/cost-centers',
        icon: Database,
        description: 'Departmental cost centers',
      },
      {
        title: 'Compliance',
        href: '/compliance',
        icon: Shield,
        description: 'Regulatory compliance tracking',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
        badge: '3',
        description: 'System alerts and notifications',
      },
      {
        title: 'Data Management',
        href: '/data',
        icon: Database,
        description: 'Data import/export and backup',
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'System configuration',
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Render simplified sidebar during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          'h-full w-64 bg-card border-r border-border flex flex-col',
          className
        )}
      >
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <div className='flex items-center gap-3'>
            <img
              src='/Logo-Health-With-Heart-Logo-Registered.svg'
              alt='Health With Heart'
              className='h-10 w-auto'
            />
            <div>
              <h2 className='text-lg font-semibold text-foreground'>OHMS</h2>
              <p className='text-xs text-muted-foreground'>Health Management</p>
            </div>
          </div>
        </div>
        <div className='flex-1 p-4'>
          <div className='text-center text-muted-foreground'>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen border-r transition-all duration-300 overflow-hidden',
        'bg-gradient-to-b from-[rgba(86,150,157,0.02)] to-[rgba(182,217,206,0.01)]',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b bg-[rgba(86,150,157,0.03)]'>
        {isCollapsed ? (
          <div className='flex items-center justify-center w-full'>
            <div
              className='w-8 h-8 rounded-lg flex items-center justify-center'
              style={{ backgroundColor: 'var(--teal)' }}
            >
              <Heart className='h-4 w-4 text-white' />
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <img
              src='/Logo-Health-With-Heart-Logo-Registered.svg'
              alt='Health With Heart'
              className='h-10 w-auto'
            />
          </div>
        )}
        {!isCollapsed && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='hover-lift'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Collapse Button for collapsed state */}
      {isCollapsed && (
        <div className='px-2 pb-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='hover-lift w-full'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin'>
        <nav className='space-y-6'>
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {!isCollapsed && (
                <div className='px-4 mb-2'>
                  <h3
                    className={cn(
                      'text-sm font-yrsa-semibold uppercase tracking-wider',
                      section.title === 'Overview' && 'text-[#56969D]', // Soft Teal
                      section.title === 'Medical Management' &&
                        'text-[#E19985]', // Coral
                      section.title === 'Personnel' && 'text-[#586D6A]', // Forest
                      section.title === 'Organization' && 'text-[#EAB75C]', // Daisy (golden yellow)
                      section.title === 'System' && 'text-[#D65241]' // Sunset (warm red)
                    )}
                  >
                    {section.title}
                  </h3>
                </div>
              )}

              <div className='space-y-1 px-2'>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  // Define section-specific colors
                  const getSectionColors = (sectionTitle: string) => {
                    switch (sectionTitle) {
                      case 'Overview':
                        return {
                          hoverBg: 'hover:bg-[rgba(86,150,157,0.08)]', // Soft Teal
                          hoverText: 'hover:text-[#178089]', // Teal
                          activeBg: 'bg-[rgba(86,150,157,0.12)]',
                          activeText: 'text-[#178089]',
                          activeBorder: 'border-l-[#178089]',
                          iconHover: 'group-hover:text-[#178089]',
                        };
                      case 'Medical Management':
                        return {
                          hoverBg: 'hover:bg-[rgba(229,153,133,0.08)]', // Coral
                          hoverText: 'hover:text-[#E19985]', // Coral
                          activeBg: 'bg-[rgba(229,153,133,0.12)]',
                          activeText: 'text-[#E19985]',
                          activeBorder: 'border-l-[#E19985]',
                          iconHover: 'group-hover:text-[#E19985]',
                        };
                      case 'Personnel':
                        return {
                          hoverBg: 'hover:bg-[rgba(86,109,106,0.08)]', // Forest
                          hoverText: 'hover:text-[#586D6A]', // Forest
                          activeBg: 'bg-[rgba(86,109,106,0.12)]',
                          activeText: 'text-[#586D6A]',
                          activeBorder: 'border-l-[#586D6A]',
                          iconHover: 'group-hover:text-[#586D6A]',
                        };
                      case 'Organization':
                        return {
                          hoverBg: 'hover:bg-[rgba(234,183,92,0.08)]', // Daisy (golden yellow)
                          hoverText: 'hover:text-[#EAB75C]', // Daisy
                          activeBg: 'bg-[rgba(234,183,92,0.12)]',
                          activeText: 'text-[#EAB75C]',
                          activeBorder: 'border-l-[#EAB75C]',
                          iconHover: 'group-hover:text-[#EAB75C]',
                        };
                      case 'System':
                        return {
                          hoverBg: 'hover:bg-[rgba(214,82,65,0.08)]', // Sunset (warm red)
                          hoverText: 'hover:text-[#D65241]', // Sunset
                          activeBg: 'bg-[rgba(214,82,65,0.12)]',
                          activeText: 'text-[#D65241]',
                          activeBorder: 'border-l-[#D65241]',
                          iconHover: 'group-hover:text-[#D65241]',
                        };
                      default:
                        return {
                          hoverBg: 'hover:bg-[rgba(86,150,157,0.08)]', // Default Soft Teal
                          hoverText: 'hover:text-[#178089]',
                          activeBg: 'bg-[rgba(86,150,157,0.12)]',
                          activeText: 'text-[#178089]',
                          activeBorder: 'border-l-[#178089]',
                          iconHover: 'group-hover:text-[#178089]',
                        };
                    }
                  };

                  const colors = getSectionColors(section.title);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className='block'
                    >
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group',
                          colors.hoverBg,
                          colors.hoverText,
                          active &&
                            `${colors.activeBg} ${colors.activeText} font-medium border-l-4 ${colors.activeBorder}`,
                          isCollapsed && 'justify-center px-2'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 flex-shrink-0 transition-colors',
                            active
                              ? colors.activeText
                              : `text-muted-foreground ${colors.iconHover}`
                          )}
                        />

                        {!isCollapsed && (
                          <>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between'>
                                <span className='truncate'>{item.title}</span>
                                {item.badge && (
                                  <Badge
                                    variant='secondary'
                                    className='ml-2 h-5 px-2 text-xs'
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className='text-xs text-muted-foreground truncate mt-0.5'>
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {sectionIndex < menuSections.length - 1 && !isCollapsed && (
                <Separator className='mx-4 mt-4' />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className='p-4 border-t flex-shrink-0 bg-[rgba(86,150,157,0.02)]'>
        {!isCollapsed ? (
          <div className='text-center'>
            <div className='text-xs text-muted-foreground'>
              OHMS Dashboard v2.0
            </div>
            <div className='text-xs text-muted-foreground mt-1'>
              Occupational Health Management
            </div>
          </div>
        ) : (
          <div className='flex justify-center'>
            <div className='w-8 h-8 bg-muted rounded-lg flex items-center justify-center'>
              <Heart className='h-4 w-4 text-muted-foreground' />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
