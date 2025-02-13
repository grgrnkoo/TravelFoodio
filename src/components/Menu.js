'use client'

import { useEffect, useMemo, useState } from "react";
import MenuDish from "./MenuDish";

export default function Menu(menuContent) {
    const [parsedMenu, setParsedMenu] = useState([]);
    const time = useMemo(() => new Date().toISOString(), []);

    useEffect(() => {
        setParsedMenu(menuContent.content);
    }, [menuContent])
    
    return (
        <div className="w-full px-4" key={time}>
            {parsedMenu.map((menuDish, index) => (
                    <MenuDish 
                        menuDish={menuDish}
                        key={menuDish.meal + index}
                    />
            ))}
        </div>
    );
}