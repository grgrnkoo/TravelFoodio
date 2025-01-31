'use client'

import MenuDish from "./MenuDish";

export default function Menu(menuContent) {
    console.log('menuContent: ', typeof(menuContent.content.menu));
    const parsedMenu = JSON.parse(menuContent.content.menu);
    return (
        <div className="w-full px-4" key={Date.now()}>
            {parsedMenu.map((menuDish) => (
                    <MenuDish 
                        menuDish={menuDish}
                        key={menuDish.meal + Date.now()}
                    />
            ))}
        </div>
    );
}