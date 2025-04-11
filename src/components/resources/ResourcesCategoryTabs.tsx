"use client";

import { useState } from 'react';
import { ResourcesTab, ResourceCategory } from '@/components/resources/ResourcesTab';
import { Resource } from '@/payload-types';

interface ResourcesCategoryTabsProps {
  contentCategories: ResourceCategory[];
  resourcesByCategory: {
    tutorials: Resource[];
    blog: Resource[];
    videos: Resource[];
    tools: Resource[];
  };
}

export const ResourcesCategoryTabs = ({ 
  contentCategories, 
  resourcesByCategory 
}: ResourcesCategoryTabsProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // Function to toggle accordion tabs
  const toggleTab = (categoryId: string) => {
    if (activeTab === categoryId) {
      setActiveTab(null); // Close if already open
    } else {
      setActiveTab(categoryId); // Open the clicked tab
    }
  };

  return (
    <div className="space-y-4">
      {contentCategories.map((category) => (
        <ResourcesTab
          key={category.id}
          category={category}
          resources={resourcesByCategory[category.id as keyof typeof resourcesByCategory] || []}
          isActive={activeTab === category.id}
          onToggle={() => toggleTab(category.id)}
          className={activeTab === category.id ? 'mb-8' : ''}
        />
      ))}
    </div>
  );
}; 