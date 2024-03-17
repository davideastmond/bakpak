import theme from '@/app/theme';
import { SecureUser } from '@/types/secure-user';
import { Box } from '@mui/material';
import { CustomGenericMuiAvatar } from '../custom-generic-user-avatar/CustomGenericUserAvatar';
import UserAvatar from '../user-avatar/UserAvatar';
import styles from './styles.module.css';

interface MultiAvatarComponentProps {
  users: Partial<SecureUser>[];
}

// This component is mainly for a chat message thread context. If a thread has multiple people, we want to show their avatars in a single component.
// We should show max 3 avatars. If there are more than 4, we should show the first 4 and a +{n} label.
// If there are 3 or fewer, we should show them all.
// They should be staggered from left to right, layered atop each other
export function MultiAvatarComponent({ users }: MultiAvatarComponentProps) {
  return (
    <Box>
      <Box>
        {users.slice(0, 3).map((user, index) => (
          <UserAvatar
            key={index}
            user={user}
            imageClassName={styles.miniImage}
            MuiAvatarComponent={<CustomGenericMuiAvatar theme={theme} />}
          />
        ))}
      </Box>
    </Box>
  );
}
