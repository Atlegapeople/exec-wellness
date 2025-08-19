import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, FileText, Calendar, CreditCard, Shield, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Heart className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Health With Heart
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Unified Executive Medical Report Platform
          </p>
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            Streamline your medical practice with integrated booking, clinical data capture, 
            live PDF preview, and automated billing - all in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-primary">
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">Demo Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Everything You Need for Executive Medical Practice
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Calendar className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Smart Booking System</CardTitle>
                <CardDescription>
                  Intelligent appointment scheduling with conflict detection and automated reminders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Live PDF Preview</CardTitle>
                <CardDescription>
                  Real-time medical report generation with instant preview and validation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CreditCard className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Automated Billing</CardTitle>
                <CardDescription>
                  Seamless Xero integration with automatic invoice generation on report sign-off
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-primary" />
                </CardTitle>
                <CardDescription>
                  POPIA-compliant with end-to-end encryption and comprehensive audit trails
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Secure access control for admin, doctor, nurse, and patient roles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Patient-Centric</CardTitle>
                <CardDescription>
                  Comprehensive patient management with medical history and consent tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Medical Practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join Health With Heart and experience the future of medical practice management
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/register">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
