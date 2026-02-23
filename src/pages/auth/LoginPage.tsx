import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../hooks/authHook';
import { useApi } from '../../hooks/useApi';
import useSocket from '../../hooks/socketHook';


export const LoginPage = () => {
    const { setAuth } = useAuth();
    const { login, loading } = useApi();
    const { socket } = useSocket();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });


    const onSubmit = async (data: { email: string, password: string }) => {
        try {
            const response = await login(data);

            const { user, accessToken } = response;

            if (user && accessToken) {
                setAuth(user, accessToken);

                if (socket) {
                    socket.auth = { token: accessToken }
                    socket.connect();
                }
            }

        } catch (error) {
            console.log(error);
        }

    };

    return (
        <AuthLayout
            title="Welcome"
            subtitle="Enter your credentials to access your account"
        >
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="pl-9"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 z-10 text-muted-foreground" />
                        <PasswordInput
                            id="password"
                            placeholder="••••••••"
                            className="pl-9"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                    </div>
                    {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                    {isSubmitting || loading ? 'Signing in...' : 'Sign in'}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link
                        to="/auth/register"
                        className="font-medium text-primary hover:underline underline-offset-4"
                    >
                        Sign up
                    </Link>
                </div>
            </motion.form>
        </AuthLayout>
    );
};
