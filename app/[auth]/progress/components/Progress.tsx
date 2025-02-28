import React, { useState } from 'react'
import { Task, Step } from '@/lib/types';


export default function Progress({ tasks, steps }: { tasks: Task[], steps: Step[], loading: boolean }) {
    const [isExtended, setIsExtended] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleTaskClick = (task: Task) => {
        if (selectedTask?.id === task.id) {
            setSelectedTask(null);
            setIsExtended(false);

        } else {
            setSelectedTask(task);
            setIsExtended(true);
        }
    }

    return (
        <div className="overflow-x-auto px-10">
            <table className="min-w-full border-collapse border-gray-300">
                <thead>
                    <tr className="">
                        <th className="p-2 max-w-[100px] font-thin border-gray-300">Title</th>
                        <th className="p-2 min-w-[150px] font-thin border-gray-300">Progress</th>
                        <th className="p-2 w-[200px] font-thin border-gray-300">End Date</th>
                        <th className="p-2 max-w-[50px] font-thin border-gray-300">Priority</th>
                        <th className="p-2 font-thin border-gray-300">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <React.Fragment key={task.id}>
                            <tr
                                onClick={() => handleTaskClick(task)}
                                className="cursor-pointer hover:bg-gray-50 font-bold"
                            >
                                <td className="p-2 border-r w-[200px] border-gray-300 font-bold">
                                    {task.title}
                                </td>
                                <td className="p-2 border-r border-gray-300">
                                    <div className="flex items-center gap-2 px-4">
                                        <div className="w-full h-6 bg-gray-200 rounded-full relative">
                                            <div
                                                className={`h-full bg-${task.priority === "high" ? "red" : task.priority === "medium" ? "yellow" : "green"}-400 rounded-full `}
                                                style={{ width: `${task.progress}%` }}
                                            >
                                                <span className='absolute top-0 right-2 text-white'>{task.progress}%</span>
                                            </div>
                                        </div>

                                    </div>
                                </td>
                                <td className="p-2 border-r  border-gray-300 flex justify-center items-center w-[200px]">{task.end_date.split('T')[0]}</td>
                                <td className="p-2 border-r border-gray-300 ">
                                    <div className='flex justify-center items-center'>
                                        <div
                                            className={`w-5 h-5 rounded-full ${task.priority === 'high'
                                                ? 'bg-red-400'
                                                : task.priority === 'medium'
                                                    ? 'bg-yellow-400'
                                                    : 'bg-green-400'
                                                }`}
                                        ></div>
                                    </div>
                                </td>
                                <td className="p-2 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{task.description} </td>

                            </tr>

                            {isExtended && selectedTask?.id === task.id && (
                                <>
                                    <tr className=''>
                                        <td colSpan={2} className="p-2">
                                            {steps
                                                .filter((step) => step.task_belong_to === task.id)
                                                .map((step) => (
                                                    <div key={step.id} className="p-2">
                                                        <p>{step.title}</p>
                                                    </div>
                                                ))}
                                        </td>
                                        <td colSpan={3} rowSpan={1} className='p-2 relative'>
                                            <div className='flex  justify-between items-center bg-gray-200 bg-opacity-30 p-4 rounded-3xl min-h-[200px]'>
                                                <div className=' '>
                                                    <h1>Assignee: </h1>
                                                    <h1>Last Update: </h1>
                                                    <h1>Latest Comment: </h1>
                                                </div>
                                                <div>
                                                    <p>as</p>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 right-0">
                                                <button className='bg-blue-500 text-white p-2 rounded-md'>
                                                    <p>Comments</p>
                                                </button>

                                            </div>
                                        </td>


                                    </tr>


                                </>

                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div >
    )
}