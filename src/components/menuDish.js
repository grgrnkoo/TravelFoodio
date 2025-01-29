'use client'

export default function MenuDish(props) {
    const { mealTime, mealDetails } = props;

    console.log('Meal from lower component: ', mealTime, mealDetails)
    return (
        <div 
            key={mealTime}
            className="w-full border border-black rounded-md my-4 p-2"
        >
            <h3>{mealTime}</h3>
            <p><strong>Meal:</strong> {mealDetails?.Meal}</p>
            <p><strong>Approximate Calories:</strong> {mealDetails["Approximate Calories"]}</p>
            <p><strong>Ingredients:</strong> {mealDetails?.Ingredients?.join(", ")}</p>
        </div>
    )
}