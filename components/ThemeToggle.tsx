"use client";
import { useTheme } from '@/providers/ThemeProvider';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            aria-label={`Geçerli tema: ${theme === 'light' ? 'açık' : 'koyu'}. Geçiş yapmak için tıklayın.`}
        >
            {theme === 'light' ? (
                // Moon icon
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 3C10.9059 3.22485 9.9 4.2 9.9 5.5C9.9 7 11.3 8 12 8.5C13.5 9.5 14.5 11 14.5 12.5C14.5 15.5 11 18 8 17C9.5 17 10 15 8.5 13.5C7.5 12.5 5.5 11.5 5 9.5C4.5 7.5 6.5 4 8.5 3C9.35 2.65 10.4 2.35 12 3Z"
                    />
                </svg>
            ) : (
                // Sun icon
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.5" />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M12 2.75V4.25"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M17.25 6.75L16.0659 7.93416"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M21.25 12.0001L19.75 12.0001"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M17.25 17.25L16.0659 16.0659"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M12 19.75V21.25"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M7.9341 16.0659L6.74996 17.25"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M4.25 12.0001L2.75 12.0001"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M7.93405 7.93423L6.74991 6.75003"
                    />
                </svg>
            )}
        </button>
    );
} 