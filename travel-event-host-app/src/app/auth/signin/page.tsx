'use client';
import AuthDialog from '@/components/auth-dialog/AuthDialog';
import { IAppActionType, useAppContext } from '@/lib/app-context';
import { useEffect } from 'react';

export default function SignInPage() {
  const { appDispatch } = useAppContext();

  useEffect(() => {
    appDispatch!({ type: IAppActionType.SET_IDLE });
  }, []);

  return <AuthDialog open={true} authDialogType={'signin'} />;
}
