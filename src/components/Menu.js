'use client'

import MenuDish from "./menuDish";

export default function Menu(menuContent) {
    const parsedMenu = JSON.parse(menuContent.content);
    console.log(parsedMenu["Meal Plan"]);
    return (
        <>
            {Object.entries(parsedMenu).map(([mealTime, mealDetails]) => (
                <>
                    <MenuDish mealTime={parsedMenu["mealTime"]} mealDetails={mealDetails} />
                    {/* <div key={mealTime}>
                    <h3>{mealTime}</h3>
                    <p><strong>Meal:</strong> {mealDetails?.Meal}</p>
                    <p><strong>Approximate Calories:</strong> {mealDetails["Approximate Calories"]}</p>
                    <p><strong>Ingredients:</strong> {mealDetails?.Ingredients?.join(", ")}</p>
                </div> */}
                </>
            ))}
        </>
    );
}