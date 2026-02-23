import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import authCover from "../../assets/auth-cover.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Form Panel */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-16 lg:px-24 py-12">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Vion
          </span>
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </motion.div>

        {/* Form Content */}
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right — Illustration Panel */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/90 via-violet-500/80 to-indigo-600/90 items-center justify-center">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-8 w-32 h-32 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <motion.img
            src={authCover}
            alt="Authentication illustration"
            className="w-full max-w-xs drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-2xl font-bold text-white">Connect Instantly</h2>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              Chat with friends and colleagues in real-time. Fast, secure, and
              beautifully simple.
            </p>
          </motion.div>

          {/* Dots indicator */}
          <div className="flex gap-2">
            <span className="w-6 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
