"use client";
import React, { useState } from "react";
import { TasksProps } from "@/lib/types";
import InfoButton from "./InfoButton";
import CommentButton from "./CommentButton";
import ExtendButton from "./ExtendButton";

function Tasks({ tasks, steps, setActiveComponent, setTaskId }: TasksProps & { setActiveComponent: (component: string) => void, setTaskId: (id: string) => void }) {
    const [isHovered, setIsHovered] = useState<string | null>(null);
    const [extendedTask, setExtendedTask] = useState<string>();

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4 w-full">
            {tasks.length > 0 ? (
                tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`relative break-inside-avoid mb-4 p-4 border border-t-8 ${task.priority === "high" ? "border-t-red-500" :
                                task.priority === "medium" ? "border-t-yellow-500" :
                                    "border-t-blue-400"
                            } border-gray-300 rounded-md bg-white shadow-md hover:shadow-lg transition-all duration-300`}
                    >
                        <h1 className="text-lg font-bold cursor-default">{task.title}</h1>

                        <div
                            className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${extendedTask === task.id ? "max-h-96" : "max-h-16"
                                }`}
                        >
                            {steps.filter((step) => step.task_id === task.id).length > 0 ? (
                                <ul className="list-disc ml-5">
                                    {steps
                                        .filter((step) => step.task_id === task.id)
                                        .map((step) => (
                                            <li
                                                key={step.id}
                                                className={`cursor-default text-gray-600 relative ${step.is_completed ? "line-through" : ""
                                                    }`}
                                                onMouseEnter={() => setIsHovered(step.id)}
                                                onMouseLeave={() => setIsHovered(null)}
                                            >
                                                {step.title}
                                                {isHovered === step.id && (
                                                    <div
                                                        className="absolute bg-white border min-w-[250px] border-gray-200 shadow-lg rounded-md p-2 z-10 max-w-xs"
                                                        style={{
                                                            left: "0",
                                                            top: "100%",
                                                        }}
                                                    >
                                                        {step.description}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No steps for this task.</p>
                            )}
                        </div>

                        <div className="flex gap-2 items-center text-center mt-2">
                            <svg
                                width="20px"
                                height="20px"
                                viewBox="0 0 0.6 0.6"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill="#454242"
                                    d="M0.17 0a0.021 0.021 0 0 1 0.021 0.021v0.039h0.226v-0.039a0.021 0.021 0 0 1 0.042 0v0.039H0.54a0.06 0.06 0 0 1 0.06 0.06v0.42A0.06 0.06 0 0 1 0.54 0.6H0.06a0.06 0.06 0 0 1 -0.06 -0.06V0.12a0.06 0.06 0 0 1 0.06 -0.06h0.089V0.021a0.021 0.021 0 0 1 0.021 -0.021M0.042 0.232v0.308a0.018 0.018 0 0 0 0.018 0.018h0.48a0.018 0.018 0 0 0 0.018 -0.018V0.233zm0.158 0.206v0.05H0.15v-0.05zm0.125 0v0.05H0.275v-0.05zm0.125 0v0.05h-0.05v-0.05zm-0.25 -0.119v0.05H0.15v-0.05zm0.125 0v0.05H0.275v-0.05zm0.125 0v0.05h-0.05v-0.05zM0.149 0.102H0.06a0.018 0.018 0 0 0 -0.018 0.018v0.07l0.516 0V0.12a0.018 0.018 0 0 0 -0.018 -0.018h-0.081v0.028a0.021 0.021 0 0 1 -0.042 0v-0.028H0.191v0.028a0.021 0.021 0 0 1 -0.042 0z"
                                />
                            </svg>
                            {task.due_date ? new Intl.DateTimeFormat("tr-TR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            }).format(new Date(task.due_date)) : "No due date"}
                        </div>

                        <div className="absolute top-2 right-2">
                            <InfoButton setActiveComponent={setActiveComponent} onClick={() => setTaskId(task.id)} />
                            <CommentButton onClick={() => { setActiveComponent("comments"); setTaskId(task.id) }} />
                        </div>

                        <div className="absolute bottom-2 right-2">
                            <ExtendButton
                                onClick={() => setExtendedTask(extendedTask === task.id ? undefined : task.id)}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No tasks found.</p>
            )}
        </div>
    );
}

export default Tasks;
