'use client';
import MenuDish from './MenuDish';
import { memo } from 'react';
import { Separator } from './ui/separator';
import MenuDishSkeleton from './loadingSkeletons/MenuDishLoading';
import MealClass from '@/classes/MealClass';
import type { IMeal, TotalNutrition } from '@/types';

type MenuItem = MealClass | IMeal | TotalNutrition;

interface MenuProps {
  content: MenuItem[];
  totalNutrition: TotalNutrition;
  showTotal?: boolean;
  loading?: boolean;
  className?: string;
}

function Menu({ content: menuContent, totalNutrition, showTotal = true, loading, className }: MenuProps) {
  const date = new Date().toISOString().split('T')[0];

  console.log('menuContent', menuContent);
  console.log('totalNutrition', totalNutrition);

  return (
    <div className={`w-full px-4 ${className || ''}`}>

      {menuContent?.map((menuDish, index) => (
        <MenuDish
          menuDish={menuDish}
          key={`${menuDish.name}-${date}`}
          index={index}
          showLike={true}
        />
      ))}

      {
        loading &&
        Array.from({ length: 3 - menuContent?.length > 0 ? 3 - menuContent?.length : 0 }).map((_, index) => (
          <MenuDishSkeleton key={index} showLike={true} className="flex-grow w-full" />
        ))
      }

      {/* Calculating total nutrition */}
      {
        Object.keys(totalNutrition).length > 0 &&
        showTotal &&
        menuContent?.length > 0 &&
        !loading &&
        <div className="w-full pt-1">
          <Separator className="my-4 w-[80%] mx-auto" />
          <MenuDish
            menuDish={totalNutrition}
            showLike={false}
          />
        </div>
      }
    </div>
  );
}

export default memo(Menu)