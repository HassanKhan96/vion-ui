import { motion } from "framer-motion";
import { MessageCirclePlus } from "lucide-react";
import newChatIllustration from "../../assets/new-chat.png";

export const StartNewChat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/20 relative overflow-hidden select-none">
      {/* Subtle decorative blob */}
      <div className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl top-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-violet-400/5 blur-3xl bottom-1/4 right-1/4 pointer-events-none" />

      <motion.div
        className="flex flex-col items-center gap-1 z-10 px-8 text-center max-w-sm "
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Illustration */}
        <motion.img
          src={newChatIllustration}
          alt="Start a new conversation"
          className="w-100 h-100 object-contain"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        />

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Start a Conversation
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a chat from the sidebar or search for someone to start
            messaging.
          </p>
        </div>

        {/* Decorative badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <MessageCirclePlus className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">
            Pick a conversation to get started
          </span>
        </div>
      </motion.div>
    </div>
  );
};
