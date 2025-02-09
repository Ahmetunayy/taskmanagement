export default function UnauthorizedPage() {
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold text-red-600">
                Unauthorized Access
            </h1>
            <p className="mt-2">
                You do not have permission to view this dashboard.
            </p>
        </div>
    );
} 