export interface Task {
    id: string;
    title: string;
    progress: number;
    description: string;
    priority: string;
    end_date: string;
    status: 'not_started' | 'in_progress' | 'completed';
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    company: string;
    created_at: string;
}

export interface TaskTag {
    id: string;
    task_id: string;
    tag_id: string;
}

export interface TaskAssignment {
    id: string;
    task_id: string;
    user_id: string;
    assigned_by: string;
    assigned_at: string;
    status: 'pending' | 'accepted' | 'rejected';
}

// İstatistik nesnesi (API yanıtı için)
export interface Statistics {
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    completion_rate: number; // Yüzde olarak
    tasks_by_status: {
        not_started: number;
        in_progress: number;
        completed: number;
    };
    tasks_by_priority: {
        low: number;
        medium: number;
        high: number;
    };
    recent_activity: {
        date: string;
        count: number;
    }[];
}


export interface Step {
    id: string;
    title: string;
    description: string;
    is_completed: boolean;
    task_belong_to: string;
}
export interface Comment {
    id: string;
    created_at: string;
    task_id: string;
    commentor: string;
    company: string;
    comment: string;
}

export interface User {
    id: string;
    firstname?: string;
    lastname?: string;
    email: string;
    avatar_url?: string;
    created_at?: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    link: string;
}

export interface TasksProps {
    tasks: Task[];
    steps: Step[];
    comments: Comment[];
    setActiveComponent: (component: string) => void;
    setTaskId: (id: string) => void;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    company: string;
    created_at: string;
}

export interface TaskTag {
    id: string;
    task_id: string;
    tag_id: string;
}

export interface TaskAssignment {
    id: string;
    task_id: string;
    user_id: string;
    assigned_by: string;
    assigned_at: string;
    status: 'pending' | 'accepted' | 'rejected';
}

// İstatistik nesnesi (API yanıtı için)
export interface Statistics {
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    completion_rate: number; // Yüzde olarak
    tasks_by_status: {
        not_started: number;
        in_progress: number;
        completed: number;
    };
    tasks_by_priority: {
        low: number;
        medium: number;
        high: number;
    };
    recent_activity: {
        date: string;
        count: number;
    }[];
}

// Role ve Permission tipleri
export interface Role {
    id: string;
    name: string;
    description?: string;
    company_id: string;
    created_at?: string;
}

export interface Permission {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
}

export interface RolePermission {
    id: string;
    role_id: string;
    permission_id: string;
    created_at: string;
}

export interface UserRole {
    id: string;
    user_id: string;
    role_id: string;
    created_at: string;
}

export interface Company {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    created_at?: string;
}

export interface CompanyEmployee {
    id: string;
    user_id: string;
    company_id: string;
    role: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

