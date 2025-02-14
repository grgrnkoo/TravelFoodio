'use client'

export default function MenuDish(props) {
    const { menuDish } = props;

    return (
        <div
            key={menuDish.name}
            className="w-full border border-black rounded-md my-4 p-2"
        >

            <p><strong>Meal:</strong> {menuDish?.name}</p>
            <p><strong>Approximate Calories:</strong> {menuDish?.calories}</p>
            <p><strong>Carbs:</strong> {menuDish?.carbs}</p>
            <p><strong>Fats:</strong> {menuDish?.fats}</p>
            <p><strong>Protein:</strong> {menuDish?.protein}</p>
            <p><strong>Ingredients:</strong> {menuDish?.ingredients?.join(", ")}</p>
        </div>
    )
}