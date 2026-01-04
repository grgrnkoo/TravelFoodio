'use client';

import { createContext, useContext, ReactNode } from 'react';

const LocationContext = createContext<string | undefined>(undefined);

export function useLocation(): string {
    const location = useContext(LocationContext);
    if (location === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return location;
}

export default function LocationProvider({
    children,
    location
}: {
    children: React.ReactNode,
    location: string | null
}) {

    const locationValue = location || 'Unknown Location';

    return (
        <LocationContext.Provider value={locationValue}>
            {children}
        </LocationContext.Provider>
    );
}