import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface LoadingScreenProps {
    className?: string;
}

export default function LoadingScreen({ className }: LoadingScreenProps) {
    return (
        <div className={cn("flex h-dvh w-full flex-col items-center justify-center gap-4 bg-background", className)}>
            <div className="relative flex items-center justify-center">
                <motion.div
                    className="absolute h-16 w-16 rounded-full border-4 border-primary/30"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
                <motion.div
                    className="h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <motion.p
                className="text-sm font-medium text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                Loading...
            </motion.p>
        </div>
    );
}
