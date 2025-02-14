'use client'

import { useEffect, useMemo, useState } from "react";
import MenuDish from "./MenuDish";

export default function Menu(menuContent) {
    // const [menu, setMenu] = useState([]);
    const time = useMemo(() => new Date().toISOString(), []);

    // useEffect(() => {
    //     setMenu(menuContent.content);
    //     console.log('Menu content: ', menu)
    // }, [menuContent])

    return (
        <div className="w-full px-4" key={time}>
            {menuContent &&
                menuContent.content.length > 0 &&
                menuContent.content.map((menuDish, index) => (
                    <MenuDish
                        menuDish={menuDish}
                        key={time + index}
                    />
                ))}
        </div>
    );
}