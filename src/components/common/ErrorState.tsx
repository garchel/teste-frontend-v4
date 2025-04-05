import { FC } from 'react';

interface ErrorStateProps {
    message: string;
}

const ErrorState: FC<ErrorStateProps> = ({ message }) => (
    <div className="p-3 text-sm text-red-500" role="alert">
        {message}
    </div>
);

export default ErrorState;