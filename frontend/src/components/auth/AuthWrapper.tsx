// AuthWrapper.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthForm from './AuthForm';
import { CircularProgress, Box } from '@mui/material';

interface AuthWrapperProps {
  children: React.ReactNode;
}

function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
}

export default AuthWrapper;