export default function MenuDish(props) {
    const { mealTime, mealDetails } = props;

    console.log('Meal from lower component: ', mealTime, mealDetails)
    return (
        <div key={mealTime}>
            <h3>{mealTime}</h3>
            <p><strong>Meal:</strong> {mealDetails?.Meal}</p>
            <p><strong>Approximate Calories:</strong> {mealDetails["Approximate Calories"]}</p>
            <p><strong>Ingredients:</strong> {mealDetails?.Ingredients?.join(", ")}</p>
        </div>
    )
}