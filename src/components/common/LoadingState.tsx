import { FC } from 'react';

interface LoadingStateProps {
    message: string;
}

const LoadingState: FC<LoadingStateProps> = ({ message }) => (
    <div className="p-3 text-sm text-gray-500" role="status" aria-live="polite">
        {message}
    </div>
);

export default LoadingState;