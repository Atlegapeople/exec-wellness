'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  Activity, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Lottie from 'lottie-react';

interface AnimatedAssessmentCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'complete' | 'incomplete' | 'insurance';
  animationData?: any;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function AnimatedAssessmentCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
  animationData,
  isLoading = false,
  onClick,
  className = ''
}: AnimatedAssessmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [animationLoaded, setAnimationLoaded] = useState(false);

  // Load animation data if not provided
  useEffect(() => {
    if (!animationData) {
      fetch('/animation/Advice for patients.json')
        .then(response => response.json())
        .then(data => {
          setAnimationLoaded(true);
        })
        .catch(error => {
          console.error('Error loading animation:', error);
          setAnimationLoaded(true);
        });
    } else {
      setAnimationLoaded(true);
    }
  }, [animationData]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'complete':
        return {
          card: 'border-green-200 bg-green-50/50 hover:bg-green-50',
          icon: 'text-green-600 bg-green-100',
          value: 'text-green-700',
          badge: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'incomplete':
        return {
          card: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
          icon: 'text-amber-600 bg-amber-100',
          value: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      case 'insurance':
        return {
          card: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
          icon: 'text-blue-600 bg-blue-100',
          value: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      default:
        return {
          card: 'border-gray-200 bg-white/50 hover:bg-gray-50',
          icon: 'text-gray-600 bg-gray-100',
          value: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-105 hover:-translate-y-1
        ${styles.card}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background Animation */}
      {animationData && animationLoaded && (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{
              width: '100%',
              height: '100%',
              filter: 'saturate(0.8) brightness(0.9)'
            }}
          />
        </div>
      )}

      {/* Floating Animation Elements */}
      {isHovered && (
        <div className="absolute top-2 right-2 opacity-20">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse" />
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg transition-all duration-300 ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className={`text-2xl font-bold transition-colors duration-300 ${styles.value}`}>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                value
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-2">
            <Badge 
              variant="outline" 
              className={`text-xs transition-all duration-300 ${styles.badge}`}
            >
              {variant === 'complete' && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {variant === 'incomplete' && <Clock className="w-3 h-3 mr-1" />}
              {variant === 'insurance' && <Users className="w-3 h-3 mr-1" />}
              {variant === 'default' && <Activity className="w-3 h-3 mr-1" />}
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Badge>
            
            {/* Action Buttons on Hover */}
            {isHovered && onClick && (
              <div className="flex space-x-1 opacity-0 animate-fade-in">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for Complete/Incomplete */}
        {(variant === 'complete' || variant === 'incomplete') && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  variant === 'complete' 
                    ? 'bg-green-500' 
                    : 'bg-amber-500'
                }`}
                style={{ 
                  width: variant === 'complete' ? '100%' : '60%' 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Shimmer Effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      )}
    </Card>
  );
}

// Preset card configurations for common assessment types
export const AssessmentCardPresets = {
  total: {
    title: 'Total Assessments',
    description: 'Executive Medical employees',
    icon: ClipboardList,
    variant: 'default' as const
  },
  complete: {
    title: 'Complete',
    description: 'Completed assessments',
    icon: Activity,
    variant: 'complete' as const
  },
  incomplete: {
    title: 'Incomplete',
    description: 'Pending completion',
    icon: TrendingUp,
    variant: 'incomplete' as const
  },
  insurance: {
    title: 'Insurance Type',
    description: 'Insurance assessments',
    icon: Users,
    variant: 'insurance' as const
  }
};
