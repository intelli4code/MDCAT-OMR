"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleAuth = async (values: FormValues, isSignUp: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = isSignUp
        ? await createUserWithEmailAndPassword(auth, values.email, values.password)
        : await signInWithEmailAndPassword(auth, values.email, values.password);
      
      if (isSignUp) {
        // Create user profile doc as per prompt
        const appId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const user = userCredential.user;
        if(appId && user) {
            const userProfileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile');
            await setDoc(userProfileRef, { email: user.email, createdAt: new Date().toISOString() });
        }
      }
      
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs defaultValue="login" className="w-full">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">OMR Quiz Master</DialogTitle>
            <DialogDescription className="text-center">
              Sign in or create an account to save your answer keys.
            </DialogDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => handleAuth(values, false))}>
              <TabsContent value="login">
                <div className="space-y-4 py-4">
                  {error && <AuthError message={error} />}
                  <AuthFormFields control={form.control} />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </form>
          </Form>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => handleAuth(values, true))}>
              <TabsContent value="signup">
                <div className="space-y-4 py-4">
                  {error && <AuthError message={error} />}
                  <AuthFormFields control={form.control} />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

const AuthFormFields = ({ control }: { control: any }) => (
  <>
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="name@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="••••••••" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const AuthError = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Authentication Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);
