import React, { useState } from 'react'
import { createTask } from '@/app/api/task/createTask'



export default function AddSteptoTask({ companyId }: { companyId: string }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");

    const handleCreateStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await createTask(title, companyId);

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }



    }



    return (
        <div>AddSteptoTask</div>
    )
}