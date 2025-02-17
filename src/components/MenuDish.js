'use client'

import { ThumbsUp } from 'lucide-react';
import { ThumbsDown } from 'lucide-react';
import { useState } from 'react';

export default function MenuDish(props) {
    const [isLiked, setIsLiked] = useState(false)
    const [isDisliked, setIsDisliked] = useState(false)
    const { menuDish } = props;

    const handlePreferenceClick = (action, e) => {
        console.log('Action: ', action, 'Ingredients: ', menuDish.ingredients, 'Event: ', e.target);
        switch (action) {
            case 'like': {
                if (isLiked) {
                    setIsLiked(false);
                } else {
                    setIsLiked(true);
                    setIsDisliked(false);
                };
                break;
            }
            case 'dislike': {
                if (isDisliked) {
                    setIsDisliked(false);
                } else {
                    setIsDisliked(true);
                    setIsLiked(false);
                };
                break;
            }
            default: {
                console.warn('Unknown action:', action);
            }
        }
    }

    return (
        <div
            key={menuDish.name}
            className="w-full border border-black rounded-md my-4 p-2"
        >

            <p><strong>Meal:</strong> {menuDish?.name}</p>
            <p><strong>Cuisine:</strong> {menuDish?.cuisine}</p>
            <p><strong>Approximate Calories:</strong> {menuDish?.calories}kcal</p>
            <p><strong>Carbs:</strong> {menuDish?.carbs}g</p>
            <p><strong>Fats:</strong> {menuDish?.fats}g</p>
            <p><strong>Protein:</strong> {menuDish?.protein}g</p>
            <p><strong>Ingredients:</strong> {menuDish?.ingredients?.join(", ")}</p>
            <div className='flex justify-end p-2 '>
                <ThumbsUp
                    className='hover:cursor-pointer'
                    strokeWidth={1}
                    fill={
                        isLiked ? 'green' : 'none'
                    }
                    stroke={
                        isLiked ? 'green' : 'black'
                    }
                    fillOpacity={.5}
                    onClick={(e) => {
                        handlePreferenceClick('like', e);
                    }}
                />
                <ThumbsDown
                    className='ml-2 hover:cursor-pointer'
                    strokeWidth={1}
                    fill={
                        isDisliked ? 'red' : 'none'
                    }
                    stroke={
                        isDisliked ? 'red' : 'black'
                    }
                    fillOpacity={.5}
                    onClick={(e) => {
                        handlePreferenceClick('dislike', e);
                    }}
                />
            </div>
        </div>
    )
}