'use client';

import { AuthClient } from '@/app/clients/auth-client/auth-client';
import { SignInAPIResponse } from '@/app/clients/auth-client/signin-api-response';
import { getLocationPostDataFromGeocoderResult } from '@/app/integration/google-maps-api/address-helper';
import { extractCoords } from '@/app/integration/google-maps-api/extract-coords';
import { TimezoneRequestor } from '@/app/integration/google-maps-api/timezone-requestor';
import { signInValidationSchema } from '@/lib/yup-validators/signin/signin-validator';
import { signUpValidationSchema } from '@/lib/yup-validators/signup/signup-validators';
import { extractValidationErrors } from '@/lib/yup-validators/utils/extract-validation-errors';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import {
  Backdrop,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { ErrorComponent } from '../ErrorComponent/ErrorComponent';
import {
  StyledDialog,
  StyledDialogActions,
  StyledDialogContent,
  StyledDialogTitle,
} from '../StyledDialog/StyledDialog';
import { Spinner } from '../spinner/Spinner';
import { SignInFields } from './sign-in-fields/SignInFields';
import { SignUpFields } from './sign-up-fields/SignUpFields';
/**
 * Dialog used for signup and login
 */

interface AuthDialogProps {
  open: boolean;
  authDialogType: 'signin' | 'signup';
}

export default function AuthDialog(props: AuthDialogProps) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formValues, setFormValues] = useState<
    Record<string, string | google.maps.GeocoderResult | null>
  >({ firstName: '', lastName: '', email: '', password1: '', password2: '', location: null });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | undefined>(undefined); // Errors returned from the API

  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorMessage = searchParams.get('error');

    if (errorMessage) {
      setErrors({
        email: ['Please check your credentials and try again'],
        password1: ['Please check your credentials and try again'],
      });
      setApiErrors({ apiError: ['We could not sign you in.'] });
    }
  }, []);

  const handleSubmit = async () => {
    // Validate the signup form
    if (props.authDialogType === 'signup') {
      try {
        signUpValidationSchema.validateSync(formValues, { abortEarly: false });
      } catch (err: any) {
        const validationErrors = extractValidationErrors(err);
        setErrors(validationErrors);
        return;
      }

      setIsLoading(true);
      // Get time zone data from google cloud API
      const coords = extractCoords((formValues.location as google.maps.GeocoderResult).geometry);

      const timezoneData = await TimezoneRequestor.getTimezoneByCoords(coords, Date.now() / 1000);

      // Try to register the user. Google location data needs to be adapted.
      try {
        console.info('Attempting to register user...');
        await AuthClient.registerUser({
          email: formValues.email as string,
          firstName: formValues.firstName as string,
          lastName: formValues.lastName as string,
          password: formValues.password1 as string,
          location: {
            ...getLocationPostDataFromGeocoderResult(
              formValues.location as google.maps.GeocoderResult,
            ),
            timezone: {
              id: timezoneData.timeZoneId!,
              name: timezoneData.timeZoneName!,
            },
          },
        });
        console.info('Registration successful');
      } catch (e: any) {
        console.error(e.message);
        setApiErrors({ apiError: [e.message] });
        return;
      } finally {
        setIsLoading(false);
      }

      // Try to signin immediately
      try {
        console.info('Signup successful - attempting to signin immediately');
        // Attempt to sign in immediately
        await AuthClient.signInUser({
          email: formValues.email as string,
          password: formValues.password1 as string,
          isRegistering: true,
          callbackUrl: '/',
        });
        console.info('Signin successful');
      } catch (e: any) {
        console.error(e.message);
        setApiErrors({ apiError: [e.message] });
        return;
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        signInValidationSchema.validateSync(formValues, { abortEarly: false });
      } catch (err: any) {
        const validationErrors = extractValidationErrors(err);
        setErrors(validationErrors);
        return;
      } finally {
        setIsLoading(false);
      }

      console.info('Attempting to sign in...');
      // Complete the signin. The nextAuth signin function will handle the default redirect,
      // or we can specify a redirect URL in the signInUser function
      const res: SignInAPIResponse = await AuthClient.signInUser({
        email: formValues.email as string,
        password: formValues.password1 as string,
        callbackUrl: '/',
      });

      if (!res.success) {
        setErrors(res.errors || {});
        setApiErrors(res.errors);
      }
    }
  };

  const handleFormValueChanged = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <StyledDialog open={props.open}>
      <Backdrop open={isLoading}>
        <Spinner />
      </Backdrop>
      <>
        <Box display='flex' justifyContent={'right'}>
          <IconButton onClick={() => router.back()}>
            <CloseIcon sx={{ color: theme.palette.primary.thirdColorIceLight }} />
          </IconButton>
        </Box>
        <StyledDialogTitle>
          <Box>
            <Box mt={2}>
              <Box>{/* App logo goes here */}</Box>
              <Box>
                <Typography
                  fontSize={['1.2rem', '1.8rem']}
                  color={theme.palette.primary.thirdColorIceLight}
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  {props.authDialogType === 'signup' ? 'Sign Up' : 'Sign In'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </StyledDialogTitle>
        <Box
          ml={'1.5rem'}
          mr={'1.5rem'}
          sx={{
            [theme.breakpoints.down(430)]: {
              marginLeft: '2px',
              marginRight: '2px',
              padding: 0,
            },
          }}
        >
          <StyledDialogContent>
            <Box
              className='providerAuthSection'
              display='flex'
              flexDirection={'column'}
              mb={2}
              mt={2}
            >
              <Box alignSelf={'center'} mb={2}>
                {/* Google sign up button */}
                <Button
                  variant='outlined'
                  startIcon={<GoogleIcon />}
                  sx={{
                    '&.MuiButtonBase-root': {
                      color: theme.palette.primary.thirdColorIceLight,
                      borderColor: theme.palette.primary.thirdColorIceLight,
                    },
                  }}
                >
                  {' '}
                  Continue with Google{' '}
                </Button>
              </Box>

              <Box alignSelf={'center'}>
                {/* Github sign up button */}
                <Button
                  variant='outlined'
                  startIcon={<GitHubIcon />}
                  sx={{
                    '&.MuiButtonBase-root': {
                      color: theme.palette.primary.thirdColorIceLight,
                      borderColor: theme.palette.primary.thirdColorIceLight,
                    },
                  }}
                >
                  {' '}
                  Continue with Github{' '}
                </Button>
              </Box>
              {props.authDialogType === 'signin' && (
                <Box alignSelf={'center'} mt={2}>
                  <Button variant='text' sx={{ color: theme.palette.primary.lightIndigo }}>
                    <Link href='/auth/signup'>Signup with e-mail</Link>
                  </Button>
                </Box>
              )}
            </Box>
            <Divider
              sx={{
                marginBottom: 3,
                '&.MuiDivider-root::before': {
                  borderColor: theme.palette.primary.thirdColorlightBlack,
                },
                '&.MuiDivider-root::after': {
                  borderColor: theme.palette.primary.thirdColorlightBlack,
                },
              }}
            >
              <Chip
                label='OR'
                size='small'
                sx={{
                  '&.MuiChip-root': {
                    backgroundColor: theme.palette.primary.thirdColorlightBlack,
                    color: theme.palette.primary.thirdColorIceLight,
                    opacity: 0.5,
                  },
                }}
              />
            </Divider>
            <form>
              {renderFormFields(props.authDialogType, handleFormValueChanged, formValues, errors)}
            </form>
          </StyledDialogContent>
          <StyledDialogActions>
            <Box
              display='flex'
              justifyContent={'space-around'}
              sx={{
                [theme.breakpoints.down(430)]: {
                  flexDirection: 'column',
                },
              }}
            >
              <Box>
                <StyledButton
                  variant={'contained'}
                  size={'large'}
                  sx={{ marginBottom: '1rem' }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {props.authDialogType === 'signup' ? 'Sign Up' : 'Go'}
                </StyledButton>
              </Box>
            </Box>
          </StyledDialogActions>
          {apiErrors && (
            <Box mb={4}>
              <ErrorComponent fieldName='apiError' errors={apiErrors} />{' '}
            </Box>
          )}
        </Box>
      </>
    </StyledDialog>
  );
}

function renderFormFields(
  authDialogType: 'signin' | 'signup',
  handleValueChanged: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined,
  formValues: Record<string, string | google.maps.GeocoderResult | null>,
  errors: Record<string, string[]>,
) {
  if (authDialogType === 'signup') {
    return SignUpFields(handleValueChanged, errors, formValues as Record<string, string>);
  }
  return SignInFields(handleValueChanged, errors, formValues as Record<string, string>);
}

const StyledButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down(430)]: {
    width: '100%',
  },
}));
