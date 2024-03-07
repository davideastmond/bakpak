'use client';
import AuthDialog from '@/components/auth-dialog/AuthDialog';
import { useAppContext } from '@/lib/app-context';
import { useEffect } from 'react';

export default function SignupPage() {
  const { dispatch } = useAppContext();

  useEffect(() => {
    dispatch({ type: 'SET_IDLE' });
  }, []);

  return <AuthDialog open={true} authDialogType={'signup'} />;
}
