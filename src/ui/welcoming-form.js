export default function WelcomingForm(props) {
    return (
        <form
            className="welcome"
            onSubmit={props.onSubmit}
        >
            <label htmlFor="age">
                Your age
            </label>
            <input
                type="text"
                placeholder="25"
                id="age"
                name="age"
            ></input>
            <label htmlFor="weight">
                Your current weight
            </label>
            <input
                type="text"
                placeholder="50kg"
                id="weight"
                name="weight"
            ></input>
            <label htmlFor="goals">
                Your goals
            </label>
            <input
                type="text"
                id="goals"
                name="goals"
                placeholder="Desired weight, or energy level..."
            ></input>
            <label htmlFor="additional-info">
                Anyhting else that worth mentioning
            </label>
            <textarea
                type="text"
                placeholder="Restrictions, deceases, or maybe you want to copy some influencer's diet. Use plain text"
                id="additionalInfo"
                name="additionalInfo"
            ></textarea>
            <button
                type="submit"
                className="startbutton"
            >Submit</button>
        </form>
    )
}