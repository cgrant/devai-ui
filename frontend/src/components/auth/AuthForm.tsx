import { useState } from 'react';
import { createUser, signIn } from '../../utils/firebase';
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleEmailChange = (e:any) => setEmail(e.target.value);
  const handlePasswordChange = (e:any) => setPassword(e.target.value);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await createUser(email, password);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ mt: 1 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxWidth={400}
      margin="auto"
    >
      <Typography component="h1" variant="h5">
        {isLogin ? 'Login' : 'Sign Up'}
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={handleEmailChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={handlePasswordChange}
      />
      <FormControlLabel
        control={<Checkbox value="remember" color="primary" />}
        label="Remember me"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        {isLogin ? 'Sign In' : 'Sign Up'}
      </Button>
      <Button
        fullWidth
        variant="outlined"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
      </Button>
    </Box>
  );
}

export default AuthForm;