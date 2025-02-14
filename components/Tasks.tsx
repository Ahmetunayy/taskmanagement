"use client";
import React, { useState } from "react";
import { TasksProps } from "@/lib/types";
import InfoButton from "./InfoButton";
import { div } from "framer-motion/client";


function Tasks({ tasks, steps, setActiveComponent, setTaskId }: TasksProps & { setActiveComponent: (component: string) => void, setTaskId: (id: string) => void }) {
    const [isHovered, setIsHovered] = useState<string | null>(null);
    return (
        <div className="columns-3 gap-4">
            {tasks.length > 0 ? (
                tasks.map((task) => (
                    <div className="relative min-w-[300px] break-inside-avoid mb-4 p-4 border border-t-8 border-t-red-400 border-gray-300 rounded-md bg-white shadow-md">
                        <h1 className="text-lg font-bold cursor-default">{task.title}</h1>
                        {steps.filter((step) => step.task_belong_to === task.id).length > 0 ? (
                            <ul className="list-disc ml-5" key={task.id}>
                                {steps
                                    .filter((step) => step.task_belong_to === task.id)
                                    .map((step) => (
                                        <div >
                                            <li key={step.id} className="cursor-default text-gray-600 relative " onMouseEnter={() => setIsHovered(step.id)} onMouseLeave={() => setIsHovered(null)}>
                                                {step.title}
                                                {isHovered === step.id && (
                                                <div className="absolute bg-white border min-w-[250px] border-gray-200 shadow-lg rounded-md p-2 z-10 max-w-xs" style={{ 
                                                    left: '0',
                                                    top: '100%',
                                                    
                                                }}>
                                                    {step.description}
                                                </div>
                                            )}
                                            </li>
                                            
                                        </div>
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
