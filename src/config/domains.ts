import { Activity, Brain, Users, Briefcase, Star } from 'lucide-react';

export const DOMAIN_CONFIG = {
  health: {
    label: 'Physical Health',
    color: '#4361ee',
    icon: Activity,
    iconBgColor: 'rgba(67, 97, 238, 0.1)'
  },
  mental: {
    label: 'Mental Wellbeing',
    color: '#4cc9f0',
    icon: Brain,
    iconBgColor: 'rgba(76, 201, 240, 0.1)'
  },
  social: {
    label: 'Social Life',
    color: '#ff8fab',
    icon: Users,
    iconBgColor: 'rgba(255, 143, 171, 0.1)'
  },
  career: {
    label: 'Career Growth',
    color: '#f77f00',
    icon: Briefcase,
    iconBgColor: 'rgba(247, 127, 0, 0.1)'
  },
  growth: {
    label: 'Personal Growth',
    color: '#2a9d8f',
    icon: Star,
    iconBgColor: 'rgba(42, 157, 143, 0.1)'
  }
}; 