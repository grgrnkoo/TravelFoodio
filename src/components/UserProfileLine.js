'use client'

import { Pencil } from 'lucide-react';
import { useState } from 'react';
import UserPreferenceEdit from './UserPreferenceEdit';

export default function UserProfileLine(props) {
    const [hovered, setHovered] = useState(false);
    const [editing, setEditing] = useState(false);

    const { userData, styleProp, nameOfLine, editable } = props;

    return (
        <div
            className={`flex justify-stretch w-full items-center ${styleProp}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <p
                className='flex-1'
            >
                {
                    nameOfLine ?
                        `${nameOfLine}: ${userData}` :
                        `${userData}`
                }
            </p>
            {
                hovered &&
                editable &&
                <Pencil
                    className='h-[1rem]'
                />
            }
        </div>
    )
}
