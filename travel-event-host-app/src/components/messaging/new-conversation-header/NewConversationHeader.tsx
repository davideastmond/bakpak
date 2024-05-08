import { UserClient } from '@/app/clients/user/user-client';
import theme from '@/app/theme';
import { SearchInputField } from '@/components/event-search/search-input-field/SearchInputField';
import { SecureUser } from '@/lib/definitions/secure-user';
import { Box, ButtonBase, ClickAwayListener, Typography } from '@mui/material';
import { useState } from 'react';
import { UserSearchResultDropdown } from '../user-search-result-dropdown/UserSearchResultDropDown';

export function NewConversationHeader({
  onCancelClicked,
  onSearchResultClicked,
}: {
  onCancelClicked?: () => void;
  onSearchResultClicked: (userId: string) => void;
}) {
  const [userSearchQueryResults, setUserSearchQueryResults] = useState<Partial<SecureUser>[]>([]);

  const performSearchQuery = async (query: string) => {
    if (!query || query?.length < 3) return;

    const results = await UserClient.getUsersBySearchQuery(query);
    if (results.length > 0) {
      setUserSearchQueryResults(results);
      return;
    }
    setUserSearchQueryResults([]);
  };

  return (
    <Box p={2}>
      <Box id='header-with-cancel-enclosure' display='flex' mb={1} justifyContent={'space-between'}>
        <Box>
          <Typography
            sx={{
              color: theme.palette.primary.charcoal,
              fontWeight: 'bold',
              fontSize: '1.25rem',
              lineHeight: '1.75em',
            }}
          >
            New Conversation
          </Typography>
        </Box>
        <Box>
          <ButtonBase onClick={() => onCancelClicked && onCancelClicked()}>
            <Typography
              sx={{
                color: theme.palette.primary.primaryColorDarkBlue,
                textDecoration: 'underline',
              }}
            >
              Cancel
            </Typography>
          </ButtonBase>
        </Box>
      </Box>
      <ClickAwayListener onClickAway={() => setUserSearchQueryResults([])}>
        {/* Search section */}
        <Box>
          {/* Search for people box */}
          <SearchInputField
            handleSearch={() => {}}
            keyword=''
            fullWidth={true}
            placeholder='Search people'
            onInputChanged={(data: string) => performSearchQuery(data)}
            id={'search-input-field'}
          />
          {/* A dropdown menu appears when the user types. A list of users should appear */}
          <UserSearchResultDropdown
            isOpen={userSearchQueryResults.length > 0}
            searchResults={userSearchQueryResults}
            onMenuItemClick={(userId) => {
              onSearchResultClicked(userId);
              setUserSearchQueryResults([]);
            }}
          />
        </Box>
      </ClickAwayListener>
    </Box>
  );
}
