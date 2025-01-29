'use client'

import MenuDish from "./menuDish";

export default function Menu(menuContent) {
    const parsedMenu = JSON.parse(menuContent.content);
    console.log(parsedMenu[0]);
    return (
        <div className="w-full px-4">
            {Object.entries(parsedMenu).map(([mealTime, mealDetails]) => (
                    <MenuDish 
                        mealTime={parsedMenu[0]} 
                        mealDetails={mealDetails} 
                    />
            ))}
        </div>
    );
}