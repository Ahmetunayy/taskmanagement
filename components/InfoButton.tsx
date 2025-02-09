import React from 'react'


export default function InfoButton({ setActiveComponent, onClick }: { setActiveComponent: (component: string) => void, onClick: () => void }) {
    return (
        <button
            onClick={() => {
                onClick(); // Set the task ID
                setActiveComponent("editTask"); // Open the right sidebar
            }}
            className="absolute top-2 right-2 hover:scale-110"
        >

            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><g fill="#0d0d0d"><path d="m12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-10 8c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z" /><path d="m12 10a1 1 0 0 1 1 1v6a1 1 0 1 1 -2 0v-6a1 1 0 0 1 1-1zm1.5-2.5a1.5 1.5 0 1 1 -3 0 1.5 1.5 0 0 1 3 0z" /></g></svg>
        </button>
    );
}