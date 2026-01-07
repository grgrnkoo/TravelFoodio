import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Check, X } from 'lucide-react';

export default function UserPreferenceEdit(props: { userData: string, inputState: boolean, onXClick: () => void, onCheckClick: (value: string) => void, handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, value: string) => void }) {
    const { userData, inputState, onXClick, onCheckClick, handleKeyDown } = props;
    const [inputValue, setInputValue] = useState(userData);

    // Sync inputValue when userData changes externally
    useEffect(() => {
        setInputValue(userData);
    }, [userData]);

    useEffect(() => {
        if (inputState) {
            setInputValue(userData); // Reset when opening the input field
        }
    }, [inputState]);
    
    return (
        <>
            {!inputState ? (
                <p className="flex justify-stretch items-center max-w-[90%]">
                    {userData}
                </p>
            ) : (
                <div className="flex justify-stretch items-center">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-[70%] flex-1 mr-2"
                        onKeyDown={(e) => handleKeyDown(e, inputValue)}
                    />
                    <Check
                        className="mr-1 hover:cursor-pointer"
                        onClick={() => onCheckClick(inputValue)}
                    />
                    <X
                        className="hover:cursor-pointer"
                        onClick={() => {
                            setInputValue(userData);
                            onXClick();
                        }}
                    />
                </div>
            )}
        </>
    );
}
