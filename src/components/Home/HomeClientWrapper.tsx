'use client';

import dynamic from 'next/dynamic';
import type { HomeGlobal } from '@/payload-types';

// Dynamically import the AnimatedHomeContent component with no SSR
// This is allowed in client components, but not in server components
const AnimatedHomeContent = dynamic(
  () => import('@/components/Home/AnimatedHomeContent'),
  { ssr: false }
);

interface HomeClientWrapperProps {
  globalData: HomeGlobal;
}

export const HomeClientWrapper = ({ globalData }: HomeClientWrapperProps) => {
  return <AnimatedHomeContent globalData={globalData} />;
};

export default HomeClientWrapper; 