"use client";
import React, { useState } from 'react';
import { Comment, User } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { useSidebar } from '@/providers/SidebarContext';

export default function Comments({ taskId, comments, users, companyId }: {
    taskId: string;
    comments: Comment[];
    users: User[];
    companyId: string;
}) {
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const { refreshData } = useSidebar();

    // Sadece bu task'a ait yorumları filtrele
    const taskComments = comments.filter(comment => comment.task_id === taskId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setLoading(true);

        const { error } = await supabase.from('comments').insert({
            comment: newComment,
            task_id: taskId,
            commentor: user.id,
            company_id: companyId
        });

        if (error) {
            console.error('Error posting comment:', error);
        } else {
            setNewComment('');
            // Sayfayı yenilemek yerine veriyi otomatik yenileyeceğiz
            await refreshData();
        }

        setLoading(false);
    };

    // Kullanıcı adını bulmak için yardımcı fonksiyon
    const getUserName = (userId: string) => {
        const commenter = users.find(u => u.id === userId);
        return commenter ? `${commenter.firstname} ${commenter.lastname}` : 'Unknown User';
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4">
                {taskComments.length > 0 ? (
                    taskComments.map(comment => (
                        <div key={comment.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-semibold text-sm">{getUserName(comment.commentor)}</h4>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm">{comment.comment}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 my-4">No comments yet</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-auto">
                <div className="flex flex-col">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-2 border rounded-md mb-2 min-h-[100px]"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 self-end"
                    >
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
