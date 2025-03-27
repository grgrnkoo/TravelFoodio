'use client';
import MenuDish from './MenuDish';
import { memo } from 'react';
import { Separator } from './ui/separator';
import MenuDishSkeleton from './loadingSkeletons/MenuDishLoading';

function Menu({ content: menuContent, totalNutrition, showTotal = true, loading }) {
  const date = new Date().toISOString().split('T')[0];
  
  return (
    <div className="w-full px-4">
      {
        loading &&
        Array.from({ length: 3 - menuContent?.length > 0 ? 3 - menuContent?.length : 0 }).map((_, index) => (
          <MenuDishSkeleton key={index} showLike={true} className="flex-grow w-full" />
        ))
      }

      {menuContent?.map((menuDish, index) => (
        <MenuDish
          menuDish={menuDish}
          key={`${menuDish.name}-${date}`}
          index={index}
          showLike={true}
        />
      ))}

      {/* Calculating total nutrition */}
      {
        Object.keys(totalNutrition).length > 0 &&
        showTotal &&
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