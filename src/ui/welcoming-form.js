'use client'

import { useState } from "react"

export default function WelcomingForm({ onSubmit }) {
    const [age, setAge] = useState();
    const [weight, setWeight] = useState();
    const [goals, setGoals] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({ age, weight, goals, additionalInfo });
    }
    return (
        <form
            className="welcome"
            onSubmit={handleSubmit}
        >
            <label htmlFor="age">
                Your age
            </label>
            <input
                type="text"
                placeholder="25"
                id="age"
                name="age"
                onChange={(e) => setAge(e.target.value)}
            ></input>
            <label htmlFor="weight">
                Your current weight
            </label>
            <input
                type="text"
                placeholder="50kg"
                id="weight"
                name="weight"
                onChange={(e) => setWeight(e.target.value)}
            ></input>
            <label htmlFor="goals">
                Your goals
            </label>
            <input
                type="text"
                id="goals"
                name="goals"
                placeholder="Desired weight, or energy level..."
                onChange={(e) => setGoals(e.target.value)}
            ></input>
            <label htmlFor="additional-info">
                Anyhting else that worth mentioning
            </label>
            <textarea
                type="text"
                placeholder="Restrictions, deceases, or maybe you want to copy some influencer's diet. Use plain text"
                id="additionalInfo"
                name="additionalInfo"
                onChange={(e) => setAdditionalInfo(e.target.value)}
            ></textarea>
            <button
                type="submit"
                className="startbutton"
            >Submit</button>
        </form>
    )
}