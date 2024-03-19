import theme from '@/app/theme';
import { SecureUser } from '@/types/secure-user';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import LocationPinIcon from '@mui/icons-material/LocationOn';
import { Box, ButtonBase, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
export interface SummarySectionProps {
  cardType: 'thread' | 'info';
  user: Partial<SecureUser>;
  onMenuClick?: (action: {
    type: SummarySectionMenuActions;
    context: { id: string; other?: any };
  }) => void;
  showElipses?: boolean;
}

export enum SummarySectionMenuActions {
  RemoveUser = 'removeUser',
}

export const SummarySection = ({
  cardType,
  user,
  onMenuClick,
  showElipses,
}: SummarySectionProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleAnchorMenu = (e: any) => {
    setAnchorEl(e.currentTarget);
    setMenuOpen(true);
  };

  const handleMenuItemClicked = (action: SummarySectionMenuActions) => {
    onMenuClick?.({ type: action, context: { id: user._id! } });
    handleClose();
  };

  if (cardType === 'thread') {
    // TODO: The text excerpt needs to be truncated if it's too long
    return (
      <Box>
        <Typography
          sx={{ color: theme.palette.primary.greyDisabled, textAlign: 'left' }}
          variant='body1'
        >
          Excerpt of latest message
        </Typography>
      </Box>
    );
  }

  // Return info (location and something else?)
  return (
    <Box display='flex' width={'100%'}>
      <Box display='flex' flexGrow={3}>
        <Box>
          <LocationPinIcon sx={{ color: theme.palette.primary.greyDisabled }} />
        </Box>
        <Box>
          <Typography variant='body1' sx={{ color: theme.palette.primary.greyDisabled }}>
            {user?.location?.city}, {user?.location?.country}
          </Typography>
        </Box>
      </Box>
      {showElipses && (
        <Box flexGrow={1} display='flex' justifyContent={'right'}>
          <ButtonBase onClick={handleAnchorMenu}>
            <LinearScaleIcon sx={{ color: theme.palette.primary.charcoal }} />
          </ButtonBase>
        </Box>
      )}
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClicked(SummarySectionMenuActions.RemoveUser)}>
          <Typography sx={{ color: theme.palette.primary.burntOrangeCancelError }}>
            Remove
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
