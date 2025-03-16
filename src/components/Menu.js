'use client';
import MenuDish from './MenuDish';
import { memo } from 'react';

function Menu({ content: menuContent }) {

  return (
    <div className="w-full px-4">
      {menuContent?.map((menuDish, index) => (
        <MenuDish
          menuDish={menuDish}
          key={menuDish.name}
          index={index}
          showLike={true}
        />
      ))}
    </div>
  );
}

export default memo(Menu)