'use client'

import { useRouter, useSearchParams } from "next/navigation";

export default function Success() {
    const searchParams = useSearchParams();
    console.log(searchParams)
    const age = searchParams.get('age');
    const weight = searchParams.get('weight');
    const goals = searchParams.get('goals');
    const additionalInfo = searchParams.get('additionalInfo');

    return (
        <div>
            <ul>
                <li>{age && `Age: ${age}`}</li>
                <li>{weight && `Weight: ${weight}`}</li>
                <li>{goals && `Goals: ${goals}`}</li>
                <li>{additionalInfo && `Additional info: ${additionalInfo}`}</li>
            </ul>
        </div>
    );
}