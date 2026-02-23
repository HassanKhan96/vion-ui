import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../hooks/authHook';
import { useApi } from '../../hooks/useApi';
import { authTokenVar } from '../../apollo/authVars';
import useSocket from '../../hooks/socketHook';

type RegisterPayload = {
    username: string;
    email: string;
    password: string;
}

export const RegisterPage = () => {

    const { setAuth } = useAuth();
    const { register: registerUser, loading } = useApi();
    const { socket } = useSocket();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });


    const onSubmit = async (v: RegisterPayload) => {
        try {
            const { username, email, password } = v
            const response = await registerUser({
                username,
                email,
                password
            })

            const { user, accessToken } = response;

            if (user && accessToken) {
                setAuth(user, accessToken);
                authTokenVar(accessToken);

                if (socket) {
                    socket.auth = { token: accessToken }
                    socket.connect();
                }
                return;
            }

            throw new Error('Failed to register user')
        } catch (error) {
            console.log(error)
        }

    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Enter your details to get started"
        >
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <Label htmlFor="username">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="username"
                            placeholder="John Doe"
                            className="pl-9"
                            {...register('username', { required: 'Name is required' })}
                        />
                    </div>
                    {errors.username && (
                        <p className="text-sm text-destructive">{errors.username.message}</p>
                    )}
                </div>

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

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 z-10 text-muted-foreground" />
                        <PasswordInput
                            id="confirmPassword"
                            placeholder="••••••••"
                            className="pl-9"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (val) => {
                                    if (watch('password') != val) {
                                        return 'Your passwords do NOT match';
                                    }
                                },
                            })}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                    {(isSubmitting || loading) ? 'Creating account...' : 'Create account'}
                    {(isSubmitting || loading) && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link
                        to="/auth/login"
                        className="font-medium text-primary hover:underline underline-offset-4"
                    >
                        Sign in
                    </Link>
                </div>
            </motion.form>
        </AuthLayout>
    );
};
