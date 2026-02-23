import { Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
    status: string;
    className?: string;
};

export const MessageStatus = ({ status, className }: Props) => {
    switch (status) {
        case 'pending':
            return <Clock className={cn("h-3 w-3 text-muted-foreground", className)} />;
        case 'sent':
            return <Check className={cn("h-3 w-3 text-muted-foreground", className)} />;
        case 'delivered':
            return <CheckCheck className={cn("h-3 w-3 text-muted-foreground", className)} />;
        case 'read':
            return <CheckCheck className={cn("h-3 w-3 text-blue-500", className)} />;
        default:
            return <Clock className={cn("h-3 w-3 text-muted-foreground", className)} />;
    }
};
