import theme from '@/app/theme';
import { MultiAvatarComponent } from '@/components/avatar/multi-avatar/MultiAvatar';
import UserAvatar from '@/components/avatar/user-avatar/UserAvatar';
import { SecureUser } from '@/types/secure-user';
import { Avatar, Box } from '@mui/material';
import styles from '../styles/styles.module.css';

export const BaseCard = ({
  users,
  children,
  backgroundColor,
  reverseFlow,
  onCardClicked,
  boxEnclosureStyles,
}: {
  users: Partial<SecureUser>[] | Partial<SecureUser>;
  children?: JSX.Element | undefined | null | (JSX.Element | null | undefined)[];
  backgroundColor?: string;
  reverseFlow?: boolean;
  onCardClicked?: () => void;
  boxEnclosureStyles?: any;
}) => {
  // The avatar needs to appear on the left or right
  return (
    <Box
      display='flex'
      bgcolor={backgroundColor || 'white'}
      padding={2}
      flexDirection={reverseFlow ? 'row-reverse' : 'row'}
      onClick={() => onCardClicked && onCardClicked()}
      sx={{
        '&:hover': {
          backgroundColor: theme.palette.primary.thirdColorIceLight,
          cursor: 'pointer',
        },
        ...boxEnclosureStyles,
      }}
    >
      <Box className='avatarEnclosure'>
        {!Array.isArray(users) ? (
          <UserAvatar
            user={users as Partial<SecureUser>}
            imageClassName={styles.mesageCardAvatar}
            MuiAvatarComponent={<Avatar className={styles.mesageCardAvatar} />}
          />
        ) : (
          <MultiAvatarComponent users={users} />
        )}
      </Box>
      {children}
    </Box>
  );
};
