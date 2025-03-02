"use client";
import React, { useState, useEffect } from 'react';
import { useSidebar } from '@/providers/SidebarContext';
import { Task } from '@/lib/types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabase';
import FilterBar, { FilterOptions } from '@/components/FilterBar';

export default function KanbanPage() {
    const { tasks, steps, setTaskId, setActiveComponent, refreshData } = useSidebar();
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [columns, setColumns] = useState({
        'not_started': {
            id: 'not_started',
            title: 'Başlanmadı',
            taskIds: [] as string[]
        },
        'in_progress': {
            id: 'in_progress',
            title: 'Devam Ediyor',
            taskIds: [] as string[]
        },
        'completed': {
            id: 'completed',
            title: 'Tamamlandı',
            taskIds: [] as string[]
        }
    });

    // Başlangıçta tüm görevleri göster
    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    // Filtreleme fonksiyonu
    const handleFilterChange = (filters: FilterOptions) => {
        let result = [...tasks];

        // Metin araması
        if (filters.query) {
            const query = filters.query.toLowerCase();
            result = result.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            );
        }

        // Öncelik filtresi (Durumu Kanban zaten gösteriyor)
        if (filters.priority !== 'all') {
            result = result.filter(task => task.priority === filters.priority);
        }

        // Sıralama
        if (filters.sortBy === 'date') {
            result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        } else if (filters.sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            result.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
        } else if (filters.sortBy === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        setFilteredTasks(result);
    };

    // Tasks'ları kolonlara ayır - şimdi filteredTasks kullanıyor
    useEffect(() => {
        const newColumns = { ...columns };

        // Reset task IDs
        newColumns.not_started.taskIds = [];
        newColumns.in_progress.taskIds = [];
        newColumns.completed.taskIds = [];

        // Assign tasks to columns based on status
        filteredTasks.forEach(task => {
            const status = task.status || 'not_started';
            if (newColumns[status as keyof typeof newColumns]) {
                newColumns[status as keyof typeof newColumns].taskIds.push(task.id);
            } else {
                newColumns.not_started.taskIds.push(task.id);
            }
        });

        setColumns(newColumns);
    }, [filteredTasks]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // Dropped outside a droppable area
        if (!destination) return;

        // Dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Move the task within the same column
        if (source.droppableId === destination.droppableId) {
            const column = columns[source.droppableId as keyof typeof columns];
            const newTaskIds = [...column.taskIds];
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    taskIds: newTaskIds
                }
            });
        }
        // Move the task to a different column
        else {
            const sourceColumn = columns[source.droppableId as keyof typeof columns];
            const destColumn = columns[destination.droppableId as keyof typeof columns];
            const sourceTaskIds = [...sourceColumn.taskIds];
            const destTaskIds = [...destColumn.taskIds];

            sourceTaskIds.splice(source.index, 1);
            destTaskIds.splice(destination.index, 0, draggableId);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    taskIds: sourceTaskIds
                },
                [destination.droppableId]: {
                    ...destColumn,
                    taskIds: destTaskIds
                }
            });

            // Update task status in database
            await supabase
                .from('tasks')
                .update({ status: destination.droppableId })
                .eq('id', draggableId);

            await refreshData();
        }
    };

    const getTaskById = (id: string): Task | undefined => {
        return tasks.find(task => task.id === id);
    };

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Kanban Tahtası</h1>

            <FilterBar onFilterChange={handleFilterChange} />

            <div className="flex overflow-x-auto py-2">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-3rem)]">
                        {Object.values(columns).map(column => (
                            <div key={column.id} className="flex flex-col bg-gray-100 rounded-lg p-4 h-full">
                                <h2 className="font-semibold text-lg mb-4 flex justify-between">
                                    {column.title}
                                    <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                                        {column.taskIds.length}
                                    </span>
                                </h2>

                                <Droppable droppableId={column.id}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-grow overflow-y-auto"
                                        >
                                            {column.taskIds.map((taskId, index) => {
                                                const task = getTaskById(taskId);
                                                if (!task) return null;

                                                return (
                                                    <Draggable
                                                        key={task.id}
                                                        draggableId={task.id}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`mb-3 p-3 bg-white rounded-md shadow-sm 
                                                                border-l-4 ${task.priority === 'high' ? 'border-red-500' :
                                                                        task.priority === 'medium' ? 'border-yellow-500' :
                                                                            'border-blue-400'
                                                                    }`}
                                                                onClick={() => {
                                                                    setTaskId(task.id);
                                                                    setActiveComponent('editTask');
                                                                }}
                                                            >
                                                                <h3 className="font-medium">{task.title}</h3>
                                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                    {task.description}
                                                                </p>
                                                                <div className="flex justify-between items-center mt-2">
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(task.due_date).toLocaleDateString()}
                                                                    </span>
                                                                    <div className="flex items-center">
                                                                        {/* Task step count */}
                                                                        {steps.filter(step => step.task_id === task.id).length > 0 && (
                                                                            <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 mr-1">
                                                                                {steps.filter(step => step.task_id === task.id).length} adım
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                <button
                                    onClick={() => {
                                        setActiveComponent('addTask');
                                    }}
                                    className="mt-3 p-2 bg-white rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    + Görev Ekle
                                </button>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
} 