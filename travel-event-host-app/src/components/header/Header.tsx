'use client';
import theme from '@/app/theme';
import { IAppActionType, useAppContext } from '@/lib/app-context';
import { useAuthContext } from '@/lib/auth-context';
import { AuthStatus } from '@/lib/auth-status';
import { Language } from '@/lib/language';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Backdrop,
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
  styled,
} from '@mui/material';
import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { HeaderBarAvatar } from '../avatar/header-bar-avatar/HeaderBarAvatar';
import { CommonButton } from '../common-button/Common-Button';
import { Spinner } from '../spinner/Spinner';
import styles from './styles.module.css';

export function Header() {
  const { session, status } = useAuthContext();
  const [lang, setLang] = useState<Language>(Language.En);
  const [navMenuIsOpen, setnavMenuIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const { appStatus, appDispatch } = useAppContext();
  const urlPathname = usePathname();

  const navigateToMyProfile = () => {
    setnavMenuIsOpen(false);
    // User is authenticated, so we can navigate to their user portal
    if (status === AuthStatus.Authenticated && session?.user) {
      appDispatch!({ type: IAppActionType.SET_LOADING });
      router.push(`/users/${session.user._id}`);
    } else {
      // User is not authenticated, so we should navigate to the login page
      appDispatch!({ type: IAppActionType.SET_LOADING });
      router.push('/auth/signin');
    }
  };

  if (status === AuthStatus.Loading)
    return (
      <Box
        display='flex'
        justifyContent={'center'}
        bgcolor={theme.palette.primary.secondaryColorDarkBlack}
        paddingTop={'1%'}
        paddingBottom={'1%'}
      >
        <Spinner variant='indeterminate' />
      </Box>
    );

  return (
    <header className={styles.header}>
      <div>
        <Backdrop open={appStatus === 'loading'}>
          <Spinner />
        </Backdrop>
        <div className={styles.logoBox}>
          <div
            onClick={() => setnavMenuIsOpen(true)}
            className={`${styles.mobile} ${styles.burgerMenu}`}
          >
            <MenuIcon />
          </div>
          <Box display='flex'>
            <Box mr={1}>
              <Image src='/images/app-logos/b_logo.png' alt='Bakpak Logo' height={30} width={20} />
            </Box>
            <Box
              sx={{
                [theme.breakpoints.down(610)]: {
                  display: 'none',
                },
              }}
            >
              <Typography variant='h4' color={theme.palette.primary.thirdColorIceLight}>
                Bakpak
              </Typography>
            </Box>
          </Box>
        </div>
        <div className={styles.authBox}>
          <Box>
            <FormControl
              variant='filled'
              sx={{
                m: 1,
                maxWidth: 90,
                '& .MuiInputBase-root': {
                  fontWeight: '400',
                  fontSize: '1.25rem',
                  color: theme.palette.primary.thirdColorIceLight,
                  backgroundColor: theme.palette.primary.secondaryColorDarkBlack,
                  '&:before': {
                    borderBottom: 'none',
                    transition: 'none',
                  },
                  '&:after': {
                    borderBottom: 'none',
                  },
                  '&:hover:before': {
                    borderBottom: 'none',
                  },
                },
                '& .MuiSvgIcon-root': {
                  color: theme.palette.primary.thirdColorIceLight,
                },
                [theme.breakpoints.down(700)]: {
                  '& .MuiInputBase-root': {
                    fontSize: '1rem',
                  },
                },
                [theme.breakpoints.down(610)]: {
                  '& .MuiInputBase-root': {
                    fontSize: '11px',
                  },
                },
              }}
            >
              <Select
                labelId='selectLanguageDropdown'
                id='selectLanguageDropdown'
                value={lang}
                onChange={(event) => setLang(event.target.value as Language)}
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: ['0.8rem', '0.8rem', '1rem'],
                  },
                  '& .MuiInputBase-input': {
                    paddingBottom: '25px',
                  },
                }}
                inputProps={{
                  paddingTop: 0,
                  MenuProps: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: '0',
                      },
                    },
                    MenuListProps: {
                      sx: {
                        backgroundColor: theme.palette.primary.secondaryColorDarkBlack,
                        color: theme.palette.primary.thirdColorIceLight,
                        borderTop: 'none',
                        '& .MuiButtonBase-root:hover': {
                          backgroundColor: theme.palette.primary.primaryColorDarkBlue,
                        },
                      },
                    },
                  },
                }}
              >
                {/* This will render languages as needed */}
                {Object.entries(Language).map(([key, value]) => (
                  <MenuItem
                    sx={{
                      '&.MuiButtonBase-root': {
                        fontSize: ['0.8rem', '0.8rem', '1rem'],
                      },
                    }}
                    key={key}
                    value={value}
                  >
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {status === AuthStatus.Authenticated ? (
            <>
              <div className={styles.avatarBox}>
                {/* Handle signout/sign out here */}
                <HeaderBarAvatar
                  userName={session?.user?.firstName || 'Default User'}
                  imageUrl={session?.user?.imageUrl}
                  onMyProfileClicked={navigateToMyProfile}
                  onSignOutClicked={() => signOut({ redirect: false, callbackUrl: '/' })}
                />
              </div>
            </>
          ) : (
            <Box
              sx={{
                [theme.breakpoints.down(410)]: {
                  display: 'none',
                },
              }}
            >
              <AuthBox />
            </Box>
          )}
        </div>
      </div>
      {status === AuthStatus.Unauthenticated && (
        <Box
          display='none'
          sx={{
            [theme.breakpoints.down(410)]: {
              display: 'block',
            },
          }}
        >
          <AuthBox />
        </Box>
      )}
      <div className={`${styles.overlay} ${navMenuIsOpen ? styles.open : ''}`}></div>
      <nav className={`${navMenuIsOpen ? styles.open : ''} ${styles.navMain}`}>
        <Box
          display='flex'
          justifyContent={'flex-end'}
          sx={{
            [theme.breakpoints.up(610)]: {
              display: 'none',
            },
          }}
        >
          <IconButton
            onClick={() => setnavMenuIsOpen(false)}
            sx={{ color: theme.palette.primary.thirdColorIceLight }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          display='flex'
          justifyContent={'space-evenly'}
          sx={{
            [theme.breakpoints.down(610)]: {
              flexDirection: 'column',
              gap: '1em',
              alignItems: 'center',
            },
          }}
        >
          <Box>
            <NavButton
              variant='text'
              color='inherit'
              onClick={() => {
                setnavMenuIsOpen(false);
                appDispatch!({ type: IAppActionType.SET_LOADING });
              }}
              disabled={urlPathname === '/'}
            >
              <Link href='/'>Home</Link>
            </NavButton>
          </Box>
          <Box>
            <NavButton
              variant='text'
              color='inherit'
              onClick={() => {
                setnavMenuIsOpen(false);
                appDispatch!({ type: IAppActionType.SET_LOADING });
              }}
              disabled={urlPathname === '/events/upcoming'}
            >
              <Link href='/events/upcoming?category=all'>Upcoming Events</Link>
            </NavButton>
          </Box>
          <Box>
            <NavButton
              variant='text'
              color='inherit'
              onClick={() => setnavMenuIsOpen(false)}
              disabled={urlPathname === '/events/search'}
            >
              <Link href='/events/search'>Search Events</Link>
            </NavButton>
          </Box>
          <Box>
            <NavButton
              variant='text'
              color='inherit'
              disabled={urlPathname === '/events/create'}
              onClick={() => {
                setnavMenuIsOpen(false);
                appDispatch!({ type: IAppActionType.SET_LOADING });
              }}
            >
              <Link href='/events/create'>Create Event</Link>
            </NavButton>
          </Box>
          <Box>
            <NavButton
              variant='text'
              color='inherit'
              disabled={urlPathname === '/about'}
              onClick={() => {
                setnavMenuIsOpen(false);
                appDispatch!({ type: IAppActionType.SET_LOADING });
              }}
            >
              <Link href='/about'>About Us</Link>
            </NavButton>
          </Box>
        </Box>
      </nav>
    </header>
  );
}

const NavButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',

  '&.Mui-disabled': {
    color: theme.palette.primary.greyDisabled,
    textDecoration: 'underline',
  },

  [theme.breakpoints.up(610)]: {
    fontSize: '1rem',
  },
}));

const AuthBox = () => {
  const router = useRouter();
  return (
    <Box
      display='flex'
      alignContent={'center'}
      sx={{
        [theme.breakpoints.down(410)]: {
          justifyContent: 'space-around',
        },
      }}
    >
      <Button
        onClick={() => signIn()} // This should redirect to the sign in page
        sx={{
          color: theme.palette.primary.thirdColorIceLight,
          marginRight: '10px',

          [theme.breakpoints.up(610)]: {
            marginRight: '1.5rem',
          },
        }}
      >
        <Typography
          sx={{
            [theme.breakpoints.down(610)]: {
              fontSize: '0.8rem',
            },
          }}
        >
          LOG IN
        </Typography>
      </Button>

      <CommonButton
        onButtonClick={() => router.push('/auth/signup')}
        label='SIGN UP'
        textColor={theme.palette.primary.thirdColorIceLight}
        backgroundColor={theme.palette.primary.primaryColorDarkBlue}
        borderColor={theme.palette.primary.primaryColorDarkBlue}
        borderRadius={'5px'}
        fontWeight='400'
        additionalStyles={{
          minWidth: '130px',
          minHeight: '24px',
          paddingLeft: '1.5em',
          paddingRight: '1.5em',
          [theme.breakpoints.down(610)]: {
            minWidth: '100px',
            minHeight: '30px',
            paddingLeft: '1em',
            paddingRight: '1em',
          },
        }}
      />
    </Box>
  );
};
