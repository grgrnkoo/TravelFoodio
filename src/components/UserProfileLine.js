'use client'

import { Pencil } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import UserPreferenceEdit from './UserPreferenceEdit';
import { UserContext } from './UserProvider';

// One line of data at user profile
export default function UserProfileLine(props) {
    const { userProfile } = useContext(UserContext);
    const { userData, styleProp, nameOfLine, editable, oneEditingFieldBoolean, setOneEditingFieldBoolean, id, setIsPopupOpen, confirmUpdate, isPopupOpen } = props;

    const [hovered, setHovered] = useState(false);
    const [inputState, setInputState] = useState(false);
    const [optimisticUserData, setOptimisticUserData] = useState(() => userData);

    useEffect(() => {
        if (!isPopupOpen && inputState) {
            onXClick();
        }
    }, [isPopupOpen]);

    useEffect(() => {
        setInputState(false);
        setOptimisticUserData(userData);
    }, [userData]);

    const onXClick = () => {
        setInputState(false);
        setOneEditingFieldBoolean(false);
        setOptimisticUserData(userData);
    };

    const onCheckClick = async (value) => {
        if (value && value !== userData && value !== '') {
            setIsPopupOpen(true);
            const confirmed = await confirmUpdate(id, value); // Wait for confirmation
            if (confirmed) {
                setOptimisticUserData(value);
            } else {
                onXClick();
            }
        } else if (!value) {
            console.error('No value to patch');
            throw new Error('No value provided');
        }
        setInputState(false);
        setOneEditingFieldBoolean(false);
    };

    const onPencilClick = () => {
        if (!oneEditingFieldBoolean) {
            setInputState(true);
            setOneEditingFieldBoolean(true);
        }
    }

    const handleKeyDown = async (e, value) => {

        console.log(value);
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            await onCheckClick(value);
        } else if (e.key === 'Escape') {
            onXClick();
        }
        console.log('Key: ');
        console.log(e.key);
    }

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
                    handleKeyDown={handleKeyDown}
                />
            </div>
            {hovered && editable && !inputState && !oneEditingFieldBoolean && (
                <Pencil
                    className={`h-[1rem] hover:cursor-pointer absolute right-0 rounded-full ${hovered && editable && !inputState ? "block" : "hidden"}`}
                    onClick={onPencilClick}
                />
            )}
        </div>
    );
}
