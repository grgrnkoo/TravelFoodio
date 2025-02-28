'use client';
import MenuDish from './MenuDish';

export default function Menu({ content: menuContent }) {
  return (
    <div className="w-full px-4">
      {menuContent?.map((menuDish, index) => (
        <MenuDish menuDish={menuDish} key={index} />
      ))}
    </div>
  );
}