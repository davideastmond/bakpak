import { SecureUser } from '@/lib/definitions/secure-user';
import { Box, MenuItem, Stack } from '@mui/material';
import { AvatarMessageHeaderCard } from '../avatar-message-header-card/AvatarMessageHeaderCard';

export const UserSearchResultDropdown = ({
  isOpen,
  searchResults,
  onMenuItemClick,
}: {
  isOpen: boolean;
  searchResults: Array<Partial<SecureUser>>;
  onMenuItemClick: (userId: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <Stack sx={{ zIndex: 1, position: 'absolute' }}>
      {searchResults.map((user) => (
        <UserSearchResultDropdownMenuItem
          key={user._id}
          user={user}
          onMenuItemClick={onMenuItemClick}
        />
      ))}
    </Stack>
  );
};

const UserSearchResultDropdownMenuItem = ({
  user,
  onMenuItemClick,
}: {
  user: Partial<SecureUser>;
  onMenuItemClick?: (userId: string) => void;
}) => {
  return (
    <MenuItem sx={{ width: '100%' }} onClick={() => onMenuItemClick && onMenuItemClick(user._id!)}>
      <Box width={'100%'}>
        <AvatarMessageHeaderCard user={user} />
      </Box>
    </MenuItem>
  );
};
