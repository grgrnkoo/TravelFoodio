'use client'

import { Pencil } from 'lucide-react';
import { useState } from 'react';
import UserPreferenceEdit from './UserPreferenceEdit';

export default function UserProfileLine(props) {
    const { userData, styleProp, nameOfLine, editable, oneEditingFieldBoolean, setOneEditingFieldBoolean } = props;

    const [hovered, setHovered] = useState(false);
    const [inputState, setInputState] = useState(false);
    const [optimisticUserData, setOptimisticUserData] = useState(userData);

    const onXClick = () => {
        setInputState(false);
        setOneEditingFieldBoolean(false);
    };

    const onCheckClick = (value) => {
        console.log(value);
        setOptimisticUserData(value);
        setInputState(false);
        setOneEditingFieldBoolean(false);
    };

    return (
        <div
            className={`relative flex justify-stretch w-full items-center ${styleProp}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <p className="flex-1">
                {nameOfLine && <span className="text-xs">{nameOfLine}:</span>}
                <UserPreferenceEdit
                    userData={optimisticUserData}
                    inputState={inputState}
                    onXClick={onXClick}
                    onCheckClick={onCheckClick}
                />
            </p>
            {hovered && editable && !inputState && !oneEditingFieldBoolean && (
                <Pencil
                    className={`h-[1rem] hover:cursor-pointer absolute right-0 rounded-full ${hovered && editable && !inputState ? "block" : "hidden"}`}
                    onClick={() => {
                        if (!oneEditingFieldBoolean) {
                            setInputState(true);
                            setOneEditingFieldBoolean(true);
                        }
                    }}
                />
            )}
        </div>
    );
}
