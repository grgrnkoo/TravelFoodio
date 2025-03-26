'use client';

import { useEffect, useState } from 'react';
import { getInAppBrowserInfo } from '../../_lib/actions';
import { Button } from './ui/button';

export default function InAppBrowserBanner({ className }) {
    const [showBanner, setShowBanner] = useState(false);
    const [visible, setVisible] = useState(false); // for animation trigger

    useEffect(() => {
        const { isInAppBrowser } = getInAppBrowserInfo();
        if (isInAppBrowser) {
            setShowBanner(true);
            setTimeout(() => {
                setVisible(true);
            }, 400);
        }
    }, []);

    if (!showBanner) return null;

    return (
        <div
            className={`${className} fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 transform ${visible ? 'translate-y-0' : 'translate-y-full'
                } bg-yellow-100 text-yellow-900 p-3 text-sm flex justify-between items-center shadow-md`}
        >
            <span>
                You're using an in-app browser (Instagram or TikTok). Some features might not work properly.
            </span>
            <Button
                onClick={() => window.open(window.location.href, '_blank')}
                className="ml-4 underline font-medium"
            >
                Open in Browser
            </Button>
        </div>
    );
}
