'use client';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useContext } from 'react';
import { UserContext } from './UserProvider';
import { usePopup } from './providers/PopUpProvider';

export default function MenuDish({ menuDish }) {
    const { userProfile } = useContext(UserContext);
    const { showPopup } = usePopup();
    const [like, setLike] = useState(false);
    const [dislike, setDislike] = useState(false);

    // Fetch initial state on load
    useEffect(() => {
        if (userProfile?._id) {
            setLike(userProfile.favoriteMeals.some(m => m.name === menuDish.name));
            setDislike(userProfile.dislikedMeals.some(m => m.name === menuDish.name));
        }
    }, [userProfile, menuDish.name]);

    // Simple debounce function
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const updatePreference = useCallback(
        debounce(async (action) => {
            try {
                const response = await fetch('/api/preferenceUpdate', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userProfile._id, meal: menuDish, action }),
                });
                const data = await response.json();
                if (response.ok) {
                    setLike(action === 'like' ? !like : false);
                    setDislike(action === 'dislike' ? !dislike : false);
                    showPopup('Updated successfully!', 'success');
                } else {
                    console.error('Update failed:', data.error);
                    showPopup(`Error: ${data.error || 'Update failed'}`, 'error');
                }
            } catch (error) {
                console.error('Request error:', error);
                showPopup('Network error:', 'error');
            }
        }, 500),
        [menuDish, like, dislike, userProfile?._id]
    );

    const handleClick = (action) => {
        updatePreference(action);
    };

    return (
        <div className="w-full border border-black rounded-md my-4 p-2">
            <p><strong>Meal:</strong> {menuDish?.name}</p>
            <p><strong>Cuisine:</strong> {menuDish?.cuisine}</p>
            <p><strong>Calories:</strong> {menuDish?.calories}kcal</p>
            <p><strong>Ingredients:</strong> {menuDish?.ingredients?.join(', ')}</p>
            <div className="flex justify-end p-2">
                <ThumbsUp
                    className="hover:cursor-pointer"
                    fill={like ? 'green' : 'none'}
                    stroke={like ? 'green' : 'black'}
                    fillOpacity={0.5}
                    onClick={() => handleClick('like')}
                />
                <ThumbsDown
                    className="ml-2 hover:cursor-pointer"
                    fill={dislike ? 'red' : 'none'}
                    stroke={dislike ? 'red' : 'black'}
                    fillOpacity={0.5}
                    onClick={() => handleClick('dislike')}
                />
            </div>
        </div>
    );
}