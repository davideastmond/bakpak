import { errorMessageFontSizes } from '@/app/common-styles/form-field-sizes';
import theme from '@/app/theme';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, Typography } from '@mui/material';
/**
 * Renders error text under the input field when validation fails
 */
export const ErrorComponent = ({
  fieldName,
  errors,
  errorIconStyles,
  typographyStyles,
  containerStyles,
}: {
  fieldName: string;
  errors: Record<string, string[]>;
  errorIconStyles?: { [key: string]: string };
  typographyStyles?: { [key: string]: string };
  containerStyles?: { [key: string]: string };
}) => {
  if (fieldName in errors) {
    return (
      <Box
        display='flex'
        flexDirection={'column'}
        sx={{
          ...containerStyles,
        }}
      >
        {errors[fieldName].map((error, index) => (
          <Box key={`${index}_${fieldName}`} display='flex'>
            <ErrorIcon
              key={`${index}_${fieldName}`}
              sx={{
                fontSize: errorMessageFontSizes,
                color: theme.palette.primary.burntOrangeCancelError,
                marginRight: '5px',
                alignSelf: 'center',
                ...typographyStyles,
                ...errorIconStyles,
              }}
            />
            <Typography
              key={index}
              sx={{
                color: theme.palette.primary.burntOrangeCancelError,
                fontSize: errorMessageFontSizes,
                ...typographyStyles,
              }}
            >
              {error}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};
