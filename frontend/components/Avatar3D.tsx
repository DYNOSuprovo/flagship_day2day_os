"use client";

import { useState } from 'react';

export default function Avatar3D() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="w-full h-[400px] relative flex items-center justify-center">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            )}
            <iframe
                src='https://my.spline.design/robot-c556730a84d7285519782559524d9c6c/'
                frameBorder='0'
                width='100%'
                height='100%'
                onLoad={() => setIsLoading(false)}
                className="w-full h-full pointer-events-auto"
            />
        </div>
    );
}
