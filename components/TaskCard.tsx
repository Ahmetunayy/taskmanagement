"use client";
import React, { useState, useEffect } from 'react';
import { Task, Step, Tag, User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';

interface TaskCardProps {
    task: Task;
    steps: Step[];
    onClick: () => void;
}

export default function TaskCard({ task, steps, onClick }: TaskCardProps) {
    const { selectedCompany } = useUser();
    const [tags, setTags] = useState<Tag[]>([]);
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);

    useEffect(() => {
        // Görevin etiketlerini yükle
        async function fetchTaskTags() {
            const { data } = await supabase
                .from('task_tags')
                .select('tag_id')
                .eq('task_id', task.id);

            if (data && data.length > 0) {
                const tagIds = data.map(item => item.tag_id);

                const { data: tagsData } = await supabase
                    .from('tags')
                    .select('*')
                    .in('id', tagIds);

                if (tagsData) setTags(tagsData);
            }
        }

        // Görevin atandığı kullanıcıları yükle
        async function fetchAssignedUsers() {
            const { data } = await supabase
                .from('task_assignments')
                .select('user_id')
                .eq('task_id', task.id)
                .eq('status', 'accepted');

            if (data && data.length > 0) {
                const userIds = data.map(item => item.user_id);

                const { data: usersData } = await supabase
                    .from('users')
                    .select('*')
                    .in('id', userIds);

                if (usersData) setAssignedUsers(usersData);
            }
        }

        fetchTaskTags();
        fetchAssignedUsers();
    }, [task.id]);

    // Görev bitiş tarihine kalan süreyi hesapla
    const timeLeft = formatDistanceToNow(new Date(task.end_date), {
        addSuffix: true,
        locale: tr
    });

    // Görevin tamamlanma yüzdesini hesapla
    const taskSteps = steps.filter(step => step.task_belong_to === task.id);
    const completedSteps = taskSteps.filter(step => step.is_completed);
    const progress = taskSteps.length > 0
        ? Math.round((completedSteps.length / taskSteps.length) * 100)
        : 0;

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer ${task.priority === 'high' ? 'border-red-500' :
                    task.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{task.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {task.status === 'completed' ? 'Tamamlandı' :
                        task.status === 'in_progress' ? 'Devam Ediyor' : 'Başlanmadı'}
                </span>
            </div>

            {/* Etiketler */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map(tag => (
                        <span
                            key={tag.id}
                            className="px-2 py-0.5 text-xs rounded-full"
                            style={{
                                backgroundColor: tag.color + '20',
                                color: tag.color
                            }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{task.description}</p>

            {/* İlerleme çubuğu */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{timeLeft}</span>

                {/* Atanan kullanıcılar */}
                {assignedUsers.length > 0 && (
                    <div className="flex -space-x-2">
                        {assignedUsers.slice(0, 3).map(user => (
                            <div
                                key={user.id}
                                className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs border border-white"
                                title={`${user.firstname} ${user.lastname}`}
                            >
                                {user.firstname?.[0]}{user.lastname?.[0]}
                            </div>
                        ))}

                        {assignedUsers.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border border-white">
                                +{assignedUsers.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 