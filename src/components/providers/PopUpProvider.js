// components/PopupProvider.js
'use client';
import { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PopupContext = createContext();

export function PopUpProvider({ children }) {
    const [popup, setPopup] = useState(null);

    const showPopup = (message, type = 'success') => {
        setPopup({ message, type });
        setTimeout(() => setPopup(null), 1200); // Auto-hide after 2s
    };

    return (
        <PopupContext.Provider value={{ showPopup }}>
            {children}
            <Notification show={!!popup} type={popup?.type || 'success'} message={popup?.message} />
        </PopupContext.Provider>
    );
}

// Your v0-generated Notification component
function Notification({ show, type, message }) {
    return (
        <div className="fixed inset-x-0 bottom-0 flex justify-center items-center p-4 z-50 pointer-events-none">
            <div
                className={cn(
                    'transform transition-all duration-300 ease-in-out pointer-events-auto',
                    show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
                    'max-w-md w-full rounded-lg shadow-lg p-4 flex items-center',
                    type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                )}
            >
                <div className="flex items-center gap-3">
                    {type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <p className="text-sm font-medium">{message}</p>
                </div>
            </div>
        </div>
    );
}

export function usePopup() {
    return useContext(PopupContext);
}