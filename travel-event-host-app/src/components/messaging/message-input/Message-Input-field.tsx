import { Box, TextField } from '@mui/material';

export function MessageInputField() {
  return (
    <Box width={'100%'} padding={1}>
      <TextField
        fullWidth
        sx={{
          '&& .MuiOutlinedInput-root': {
            borderColor: 'pink',
          },
        }}
      />
    </Box>
  );
}
