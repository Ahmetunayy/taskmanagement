import React from 'react'

export default function ExtendButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="hover:scale-110"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9L12 16L5 9" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    )
}