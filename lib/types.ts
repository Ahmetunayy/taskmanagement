export interface Task {
    id: string;
    title: string;
}


export interface Step {
    id: string;
    title: string;
    task_belong_to: string;
}


export interface TasksProps {
    tasks: Task[];
    steps: Step[];
    setEditTask: (value: boolean) => void;
    editTask: boolean;
}