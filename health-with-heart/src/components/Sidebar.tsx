'use client';

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
  AlertTriangle
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
        description: 'Personal dashboard and profile'
      },
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        description: 'Main dashboard overview'
      },
      {
        title: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Health analytics and insights'
      }
    ]
  },
  {
    title: 'Medical Management',
    items: [
      {
        title: 'Medical Reports',
        href: '/reports',
        icon: FileText,
        description: 'View and manage medical reports'
      },
      {
        title: 'Appointments',
        href: '/appointments',
        icon: Calendar,
        description: 'Schedule and manage appointments'
      },
      {
        title: 'Calendar',
        href: '/calendar',
        icon: CalendarDays,
        description: 'Calendar view of appointments'
      },
      {
        title: 'Vitals',
        href: '/vitals',
        icon: Heart,
        description: 'Vital signs and clinical metrics'
      },
      {
        title: 'Medical Assessments',
        href: '/assessments',
        icon: ClipboardList,
        description: 'Pre-employment and periodic assessments'
      },
      {
        title: 'Medical History',
        href: '/medical-history',
        icon: FileBarChart,
        description: 'Employee medical history records'
      },
      {
        title: 'Lifestyle',
        href: '/lifestyle',
        icon: Activity,
        description: 'Lifestyle assessments and health habits'
      },
      {
        title: 'Special Investigations',
        href: '/special-investigations',
        icon: TestTube2,
        description: 'Specialized medical tests and diagnostics'
      },
      {
        title: 'Lab Tests',
        href: '/lab-tests',
        icon: TestTube2,
        description: 'Laboratory test results and analysis'
      },
      {
        title: 'Emergency Responses',
        href: '/emergency-responses',
        icon: AlertTriangle,
        description: 'Emergency response records and incident reports'
      }
    ]
  },
  {
    title: 'Personnel',
    items: [
      {
        title: 'Employees',
        href: '/employees',
        icon: Users,
        description: 'Employee records and information'
      },
      {
        title: 'Managers',
        href: '/managers',
        icon: UserCheck,
        description: 'Manager and supervisor records'
      },
      {
        title: 'Medical Staff',
        href: '/medical-staff',
        icon: Stethoscope,
        description: 'Doctors and nurses management'
      }
    ]
  },
  {
    title: 'Organization',
    items: [
      {
        title: 'Organizations',
        href: '/organizations',
        icon: Building2,
        description: 'Manage client organizations'
      },
      {
        title: 'Sites',
        href: '/sites',
        icon: MapPin,
        description: 'Site locations and workplaces'
      },
      {
        title: 'Locations',
        href: '/locations',
        icon: MapPin,
        description: 'Specific locations within sites'
      },
      {
        title: 'Cost Centers',
        href: '/cost-centers',
        icon: Database,
        description: 'Departmental cost centers'
      },
      {
        title: 'Compliance',
        href: '/compliance',
        icon: Shield,
        description: 'Regulatory compliance tracking'
      }
    ]
  },
  {
    title: 'Reports & Analytics',
    items: [
      {
        title: 'Health Trends',
        href: '/health-trends',
        icon: TrendingUp,
        description: 'Health trend analysis'
      },
      {
        title: 'Performance Reports',
        href: '/performance',
        icon: FileBarChart,
        description: 'Performance and productivity reports'
      },
      {
        title: 'Vital Statistics',
        href: '/vitals',
        icon: Activity,
        description: 'Vital signs and health metrics'
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
        badge: '3',
        description: 'System alerts and notifications'
      },
      {
        title: 'Data Management',
        href: '/data',
        icon: Database,
        description: 'Data import/export and backup'
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'System configuration'
      }
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 z-50 flex flex-col h-screen bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {isCollapsed ? (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img 
              src="/Logo-Health-With-Heart-Logo-Registered.svg" 
              alt="Health With Heart" 
              className="h-10 w-auto"
            />
          </div>
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover-lift"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Collapse Button for collapsed state */}
      {isCollapsed && (
        <div className="px-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover-lift w-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <nav className="space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {!isCollapsed && (
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              
              <div className="space-y-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      prefetch={true}
                      className="block"
                    >
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-muted/50 group",
                        active && "bg-primary/10 text-primary font-medium border-l-4 border-l-primary",
                        isCollapsed && "justify-center px-2"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="truncate">{item.title}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
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
                <Separator className="mx-4 mt-4" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        {!isCollapsed ? (
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              OHMS Dashboard v2.0
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Occupational Health Management
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}