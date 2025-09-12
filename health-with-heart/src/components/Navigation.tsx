'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
// import { supabase } from '@/lib/supabase'; // Commented out for local database migration
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    name: 'My Dashboard',
    href: '/my-dashboard',
    icon: Home,
    description: 'Your personal dashboard',
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'System overview and statistics',
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
    icon: TrendingUp,
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
  const [currentUser, setCurrentUser] = useState<{ email?: string } | null>(
    null
  );
  const [dbUser, setDbUser] = useState<{
    email: string;
    [key: string]: unknown;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current user information - Supabase commented out for local database migration
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Supabase authentication commented out
        // const {
        //   data: { user },
        // } = await supabase.auth.getUser();
        // if (user) {
        //   setCurrentUser(user);

        //   // Fetch user details from database
        //   const response = await fetch('/api/users');
        //   if (response.ok) {
        //     const usersData = await response.json();
        //     const matchingUser = usersData.users?.find(
        //       (dbUser: { email: string }) =>
        //         dbUser.email.toLowerCase() === user.email?.toLowerCase()
        //     );
        //     if (matchingUser) {
        //       setDbUser(matchingUser);
        //     }
        //   }
        // }

        // TODO: Implement local database user authentication
        // For now, set a mock user for testing
        setCurrentUser({ email: 'test@example.com' });
        setDbUser({
          email: 'test@example.com',
          name: 'Test',
          surname: 'User',
          type: 'Admin',
        });
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const handleSignOut = async () => {
    try {
      // Supabase sign out commented out for local database migration
      // await supabase.auth.signOut();

      // TODO: Implement local database sign out
      // For now, just redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (
      dbUser?.name &&
      dbUser?.surname &&
      typeof dbUser.name === 'string' &&
      typeof dbUser.surname === 'string'
    ) {
      return `${dbUser.name.charAt(0)}${dbUser.surname.charAt(0)}`.toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (
      dbUser?.name &&
      dbUser?.surname &&
      typeof dbUser.name === 'string' &&
      typeof dbUser.surname === 'string'
    ) {
      const prefix =
        dbUser.type &&
        typeof dbUser.type === 'string' &&
        dbUser.type === 'Doctor'
          ? 'Dr.'
          : '';
      return `${prefix} ${dbUser.name} ${dbUser.surname}`;
    }
    return currentUser?.email || 'User';
  };

  const getUserTitle = () => {
    if (dbUser?.type && typeof dbUser.type === 'string') {
      return dbUser.type;
    }
    return 'User';
  };

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
                      <Link
                        href={item.href}
                        className='flex items-center gap-2'
                        prefetch={true}
                      >
                        <Icon className='h-4 w-4' />
                        {item.name}
                      </Link>
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
                            <Link
                              href={action.href}
                              className='flex items-start gap-3 p-3 rounded-lg cursor-pointer'
                              prefetch={true}
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
                            </Link>
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
                className='border-sage'
                style={{
                  backgroundColor: 'rgba(180, 202, 188, 0.1)',
                  color: 'var(--sage)',
                }}
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
              <span
                className='absolute -top-1 -right-1 h-2 w-2 rounded-full'
                style={{ backgroundColor: 'var(--sunset)' }}
              ></span>
            </Button>

            <Separator orientation='vertical' className='h-6' />

            {/* User Menu */}
            {!mounted || loading ? (
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-muted rounded-full animate-pulse' />
                <div className='hidden md:block'>
                  <div className='w-20 h-3 bg-muted rounded animate-pulse mb-1' />
                  <div className='w-16 h-2 bg-muted rounded animate-pulse' />
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='flex items-center gap-2 hover-lift'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-primary text-primary-foreground text-sm'>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='hidden md:block text-left'>
                      <div className='text-sm font-medium'>
                        {getUserDisplayName()}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {getUserTitle()}
                      </div>
                    </div>
                    <ChevronDown className='h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium'>
                        {getUserDisplayName()}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className='cursor-pointer'>
                    <User className='mr-2 h-4 w-4' />
                    Profile
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
                  <DropdownMenuItem
                    className='cursor-pointer text-red-600 focus:text-red-600'
                    onClick={handleSignOut}
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
                    <Link href={item.href} prefetch={true}>
                      <Icon className='h-4 w-4' />
                      {item.name}
                    </Link>
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
                    <Link href={action.href} prefetch={true}>
                      <Icon className='h-4 w-4' />
                      {action.name}
                    </Link>
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
