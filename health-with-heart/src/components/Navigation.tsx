'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserContext';
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Settings,
  Bell,
  Search,
  Home,
  Activity,
  BarChart3,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and statistics',
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    description: 'Employee management',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Medical reports',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Data insights',
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    description: 'Schedule management',
  },
];

const quickActions = [
  {
    name: 'New Report',
    href: '/reports/new',
    icon: FileText,
    description: 'Create medical report',
  },
  {
    name: 'Schedule Appointment',
    href: '/appointments/new',
    icon: Calendar,
    description: 'Book appointment',
  },
  {
    name: 'Add Employee',
    href: '/employees/new',
    icon: Users,
    description: 'Register employee',
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useUser();
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className='glass-effect sticky top-0 z-50 border-b animate-fade-in pt-2'>
      <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw]'>
        <div className='flex justify-between items-center h-16'>
          {/* Desktop Navigation */}
          <div className='flex items-center gap-4'>
            <div className='hidden lg:flex items-center'>
              <div className='flex items-center gap-1'>
                {navigation.map(item => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? 'default' : 'ghost'}
                      size='sm'
                      className='hover-lift'
                      asChild
                    >
                      <a href={item.href} className='flex items-center gap-2'>
                        <Icon className='h-4 w-4' />
                        {item.name}
                      </a>
                    </Button>
                  );
                })}

                {/* Quick Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' className='hover-lift'>
                      <Activity className='h-4 w-4 mr-2' />
                      Quick Actions
                      <ChevronDown className='h-3 w-3 ml-1' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-80'>
                    <DropdownMenuLabel>Common Tasks</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className='grid gap-1 p-2'>
                      {quickActions.map(action => {
                        const Icon = action.icon;
                        return (
                          <DropdownMenuItem key={action.name} asChild>
                            <a
                              href={action.href}
                              className='flex items-start gap-3 p-3 rounded-lg cursor-pointer'
                            >
                              <div className='w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center'>
                                <Icon className='h-4 w-4 text-primary' />
                              </div>
                              <div>
                                <div className='font-medium text-sm'>
                                  {action.name}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {action.description}
                                </div>
                              </div>
                            </a>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Right Side - Status and User */}
          <div className='flex items-center gap-4'>
            {/* System Status */}
            <div className='hidden sm:flex items-center gap-2'>
              <Badge
                variant='default'
                className='bg-green-500/10 text-green-600 border-green-500/20'
              >
                <Activity className='h-3 w-3 mr-1' />
                System Online
              </Badge>
            </div>

            {/* Search Button */}
            <Button
              variant='ghost'
              size='sm'
              className='hover-lift hidden sm:flex'
            >
              <Search className='h-4 w-4' />
            </Button>

            {/* Notifications */}
            <Button variant='ghost' size='sm' className='hover-lift relative'>
              <Bell className='h-4 w-4' />
              <span className='absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full'></span>
            </Button>

            <Separator orientation='vertical' className='h-6' />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center gap-2 hover-lift'
                >
                  <Avatar className='h-8 w-8'>
                    {currentUser?.profileImage ? (
                      <AvatarImage 
                        src={currentUser.profileImage} 
                        alt={`${currentUser.name} ${currentUser.surname}`}
                      />
                    ) : null}
                    <AvatarFallback className='bg-primary text-primary-foreground text-sm'>
                      {currentUser ? `${currentUser.name?.[0] || ''}${currentUser.surname?.[0] || ''}` : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='hidden md:block text-left'>
                    <div className='text-sm font-medium'>
                      {currentUser ? `${currentUser.name} ${currentUser.surname}` : 'User'}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {currentUser?.type || 'User'}
                    </div>
                  </div>
                  <ChevronDown className='h-3 w-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium'>
                      {currentUser ? `${currentUser.name} ${currentUser.surname}` : 'User'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {currentUser?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <a href='/user-profile'>
                    <User className='mr-2 h-4 w-4' />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer'>
                  <Settings className='mr-2 h-4 w-4' />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer'>
                  <HelpCircle className='mr-2 h-4 w-4' />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-pointer text-red-600 focus:text-red-600'>
                  <LogOut className='mr-2 h-4 w-4' />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden hover-lift'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className='lg:hidden py-4 border-t animate-slide-up'>
            <div className='space-y-2'>
              {navigation.map(item => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    className='w-full justify-start gap-2'
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <a href={item.href}>
                      <Icon className='h-4 w-4' />
                      {item.name}
                    </a>
                  </Button>
                );
              })}
              <Separator className='my-3' />
              <div className='text-xs font-medium text-muted-foreground px-3 mb-2'>
                Quick Actions
              </div>
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.name}
                    variant='ghost'
                    className='w-full justify-start gap-2'
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <a href={action.href}>
                      <Icon className='h-4 w-4' />
                      {action.name}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
