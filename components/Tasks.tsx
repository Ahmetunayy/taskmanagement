"use client";
import React from "react";
import { TasksProps } from "@/lib/types";
import InfoButton from "./InfoButton";


function Tasks({ tasks, steps, setActiveComponent, setTaskId }: TasksProps & { setActiveComponent: (component: string) => void, setTaskId: (id: string) => void }) {
    return (
        <div className="columns-3 gap-4">
            {tasks.length > 0 ? (
                tasks.map((task) => (
                    <div key={task.id} className="relative min-w-[300px] break-inside-avoid mb-4 p-4 border border-t-8 border-t-red-400 border-gray-300 rounded-md bg-white shadow-md">
                        <h1 className="text-lg font-bold">{task.title}</h1>
                        {steps.filter((step) => step.task_belong_to === task.id).length > 0 ? (
                            <ul className="list-disc ml-5">
                                {steps
                                    .filter((step) => step.task_belong_to === task.id)
                                    .map((step) => (
                                        <li key={step.id} className="text-gray-600">
                                            {step.title}
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No steps for this task.</p>
                        )}
                        <InfoButton setActiveComponent={setActiveComponent} onClick={() => setTaskId(task.id)} />
                    </div>
                ))

            ) : (
                <p className="text-gray-500">No tasks found.</p>
            )}
        </div>
    );
}



export default Tasks;
