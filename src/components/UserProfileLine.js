'use client'

import { Pencil } from 'lucide-react';
import { useState, useContext } from 'react';
import UserPreferenceEdit from './UserPreferenceEdit';
import { UserContext } from './UserProvider';
import { updateUserByEmail } from '../../_lib/usersActions';

// One line of data at user profile
export default function UserProfileLine(props) {
    const { userProfile } = useContext(UserContext);
    const { userData, styleProp, nameOfLine, editable, oneEditingFieldBoolean, setOneEditingFieldBoolean, id } = props;

    const [hovered, setHovered] = useState(false);
    const [inputState, setInputState] = useState(false);
    const [optimisticUserData, setOptimisticUserData] = useState(userData);

    const onXClick = () => {
        setInputState(false);
        setOneEditingFieldBoolean(false);
    };

    const onCheckClick = (value) => {
        if (value !== userData) {
            setOptimisticUserData(value);
            updateUserByEmail(userProfile.email, id, value);
        }
        setInputState(false);
        setOneEditingFieldBoolean(false);
    };

    return (
        <div
            className={`relative flex justify-stretch w-full items-center ${styleProp}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="flex-1">
                {nameOfLine && <p className="text-xs">{nameOfLine}:</p>}
                <UserPreferenceEdit
                    userData={optimisticUserData}
                    inputState={inputState}
                    onXClick={onXClick}
                    onCheckClick={onCheckClick}
                />
            </div>
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
