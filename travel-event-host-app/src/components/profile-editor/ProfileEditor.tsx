import theme from '@/app/theme';

import { profileFormHeaderSizes } from '@/app/common-styles/form-field-sizes';
import { extractCoords } from '@/app/integration/google-maps-api/extract-coords';
import {
  GoogleMapsTimezoneData,
  TimezoneRequestor,
} from '@/app/integration/google-maps-api/timezone-requestor';
import { ImageType, SpacesImageInteractor } from '@/app/integration/utils/spaces-image-interactor';
import { profileUpdateValidationSchema } from '@/lib/yup-validators/profile-update/profile-update-validator';
import { extractValidationErrors } from '@/lib/yup-validators/utils/extract-validation-errors';
import { SecureUser } from '@/types/secure-user';
import { Box, Button, Typography } from '@mui/material';
import { Suspense, useState } from 'react';
import avatarStyles from '../../app/common-styles/avatar-styles.module.css';
import { ErrorComponent } from '../ErrorComponent/ErrorComponent';
import { AddressAutocomplete } from '../address-autocomplete/AddressAutocomplete';
import { CustomGenericMuiAvatar } from '../avatar/custom-generic-user-avatar/CustomGenericUserAvatar';
import UserAvatar from '../avatar/user-avatar/UserAvatar';
import { CustomTextField, StyledFormFieldSection } from '../custom-fields/CustomFields';
import { ImagePicker } from '../image-picker/ImagePicker';
import { Spinner } from '../spinner/Spinner';

type EditableProfileFields = 'firstName' | 'lastName' | 'bio' | 'imageUrl' | 'location';

interface ProfileEditorProps {
  editDisabled?: boolean;
  user?: Partial<SecureUser>;
  onLocationUpdate?: (
    location: google.maps.places.PlaceResult | null,
    timezoneData: GoogleMapsTimezoneData,
  ) => void;
  onProfileUpdate?: (
    formValues: Record<EditableProfileFields, string | null>,
    deleteImageUrl?: boolean,
  ) => void;
  isLoading?: boolean;
}

const profilNotEditableContentSizes = ['0.9rem', '0.9rem', '1rem', '1.2rem', '1.2rem'];

export function ProfileEditor({
  editDisabled,
  user,
  onProfileUpdate,
  onLocationUpdate,
}: ProfileEditorProps) {
  const [formValues, setFormValues] = useState<Record<EditableProfileFields, string | null>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    imageUrl: user?.imageUrl || null,
    location: editDisabled ? formatUserLocation(user!) : user?.location?.formattedAddress || '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const handleFormFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // We validate once
    setFormErrors({});
    try {
      profileUpdateValidationSchema.validateSync(formValues, { abortEarly: false });
    } catch (err: any) {
      const errors = extractValidationErrors(err);
      setFormErrors(errors);
      return;
    }

    // Validation is successful do a callback here with the formValues
    onProfileUpdate && onProfileUpdate(formValues as any);
  };

  const handleLocationUpdate = async (location: google.maps.places.PlaceResult | null) => {
    const coords = extractCoords(location?.geometry as google.maps.GeocoderGeometry);

    const timezoneData = await TimezoneRequestor.getTimezoneByCoords(coords, Date.now() / 1000);
    onLocationUpdate && onLocationUpdate(location, timezoneData);
  };

  const handleAvatarImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // TODO: check this and refactor with proper error display (DRY)
      if (!file.type.match('image.*')) {
        console.error('File is not an image');
        return;
      }

      try {
        const cdnResolvePath = await SpacesImageInteractor.upload({
          file,
          imageType: ImageType.USER,
          objectNameSeed: user?._id!,
        });
        setFormValues({ ...formValues, imageUrl: cdnResolvePath });
        onProfileUpdate &&
          onProfileUpdate({
            firstName: formValues.firstName!,
            lastName: formValues.lastName!,
            bio: formValues.bio!,
            imageUrl: cdnResolvePath, // We update the imageUrl
          } as any);
      } catch (e: any) {
        console.error(e.message);
      } finally {
        // Clear the input
        e.target.value = '';
      }
    }
  };

  const handleDeleteImageClick = () => {
    setFormValues({ ...formValues, imageUrl: null });
    onProfileUpdate && onProfileUpdate({ ...formValues, imageUrl: null } as any, true);
  };

  return (
    <Box
      className='profileEditorMain'
      sx={{
        [theme.breakpoints.down(430)]: {
          width: '430px',
          marginLeft: '5px',
          marginRight: '5px',
        },
      }}
    >
      <Box
        display='flex'
        className='contentBodyContainer'
        width='100%'
        gap={3}
        sx={{
          [theme.breakpoints.down(430)]: {
            flexDirection: 'column',
          },
        }}
      >
        <Box
          className='avatarContainer'
          display={'flex'}
          justifyContent={'center'}
          alignSelf={'center'}
          width={'100%'}
          flexDirection={'column'}
        >
          <UserAvatar
            user={user}
            MuiAvatarComponent={<CustomGenericMuiAvatar theme={theme} />}
            imageClassName={avatarStyles.userAvatar}
            nameStyles={{
              color: theme.palette.primary.thirdColorIceLight,
              fontWeight: 'bold',
            }}
          />
          {!editDisabled && (
            // Photo upload button
            <Box display='flex' justifyContent={'center'} flexDirection={'column'}>
              <Box>
                <ImagePicker buttonTitle='Choose Image' onImageSelected={handleAvatarImageChange} />
              </Box>
              {user?.imageUrl && (
                <Box display={'flex'} justifyContent={'center'} mt={'10px'}>
                  <Button
                    onClick={handleDeleteImageClick}
                    variant='text'
                    sx={{
                      color: theme.palette.primary.primaryColorDarkerBlue,
                      textTransform: 'none',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    Delete image
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Box
          display='flex'
          className='profileFormFields'
          flexDirection={'column'}
          gap={1}
          pr={'1%'}
          width={'100%'}
          sx={{
            [theme.breakpoints.down(430)]: {
              marginTop: 2,
            },
          }}
        >
          <Box
            display='flex'
            gap={1}
            sx={{
              [theme.breakpoints.down(430)]: {
                flexDirection: 'column',
              },
            }}
          >
            <StyledFormFieldSection>
              {editDisabled ? (
                <Suspense fallback={<Spinner />}>
                  <Typography
                    sx={{
                      fontSize: profilNotEditableContentSizes,
                      color: theme.palette.primary.thirdColorIceLight,
                      fontWeight: 'bold',
                    }}
                  >
                    {user?.firstName}
                  </Typography>
                </Suspense>
              ) : (
                <Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: profileFormHeaderSizes,
                      }}
                      color={theme.palette.primary.thirdColorIceLight}
                    >
                      First Name
                    </Typography>

                    <CustomTextField
                      placeholder='First Name'
                      name='firstName'
                      value={formValues.firstName}
                      onBlur={handleFormFieldBlur}
                      fullWidth
                      onChange={(e) =>
                        setFormValues({ ...formValues, [e.target.name]: e.target.value })
                      }
                    />
                    <ErrorComponent
                      fieldName='firstName'
                      errors={formErrors}
                      typographyStyles={{
                        color: 'red',
                      }}
                    />
                  </Box>
                </Box>
              )}
            </StyledFormFieldSection>
            <StyledFormFieldSection>
              {editDisabled ? (
                <Suspense fallback={<Spinner />}>
                  <Typography
                    sx={{
                      fontSize: profilNotEditableContentSizes,
                      color: theme.palette.primary.thirdColorIceLight,
                      fontWeight: 'bold',
                    }}
                  >
                    {user?.lastName}
                  </Typography>
                </Suspense>
              ) : (
                <Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: profileFormHeaderSizes,
                      }}
                      color={theme.palette.primary.thirdColorIceLight}
                    >
                      Last Name
                    </Typography>
                    <CustomTextField
                      placeholder='Last Name'
                      name='lastName'
                      onBlur={handleFormFieldBlur}
                      onChange={(e) =>
                        setFormValues({ ...formValues, [e.target.name]: e.target.value })
                      }
                      value={formValues.lastName}
                      fullWidth
                    />
                    <ErrorComponent
                      fieldName='lastName'
                      errors={formErrors}
                      typographyStyles={{
                        color: 'red',
                      }}
                    />
                  </Box>
                </Box>
              )}
            </StyledFormFieldSection>
          </Box>
          <Box>
            {/* Location */}
            <StyledFormFieldSection>
              {editDisabled ? (
                <Typography
                  sx={{
                    fontSize: profilNotEditableContentSizes,
                    color: theme.palette.primary.charcoal,
                  }}
                >
                  {formatUserLocation(user!)}
                </Typography>
              ) : (
                <Box>
                  <Box>
                    {/* Show the formatted address */}
                    <Typography
                      sx={{
                        fontSize: profilNotEditableContentSizes,
                        color: theme.palette.primary.charcoal,
                      }}
                    >
                      {user?.location?.formattedAddress || 'No location'}
                    </Typography>
                  </Box>
                  <Box>
                    {/* Google address field allowing user to change their address */}
                    <AddressAutocomplete
                      componentName='location'
                      onLocationSelected={handleLocationUpdate}
                    />
                  </Box>
                </Box>
              )}
            </StyledFormFieldSection>
          </Box>
          <Box>
            <StyledFormFieldSection
              sx={{
                '& .MuiFormControl-root': {
                  width: '100%',
                  backgroundColor: theme.palette.primary.thirdColorIceLight,
                },
              }}
            >
              {editDisabled ? (
                <Typography
                  sx={{
                    fontSize: profilNotEditableContentSizes,
                    color: theme.palette.primary.charcoal,
                  }}
                >
                  {user?.bio || 'No Bio'}
                </Typography>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontSize: profileFormHeaderSizes,
                    }}
                    color={theme.palette.primary.thirdColorIceLight}
                  >
                    Bio
                  </Typography>
                  <CustomTextField
                    placeholder='Bio max 255 chars.'
                    multiline
                    minRows={6}
                    maxRows={6}
                    inputProps={{ maxLength: 255 }}
                    name='bio'
                    value={formValues.bio}
                    onBlur={handleFormFieldBlur}
                    onChange={(e) =>
                      setFormValues({ ...formValues, [e.target.name]: e.target.value })
                    }
                  />
                  <ErrorComponent
                    fieldName='bio'
                    errors={formErrors}
                    typographyStyles={{
                      color: 'red',
                    }}
                  />
                </>
              )}
            </StyledFormFieldSection>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function formatUserLocation(user: Partial<SecureUser>) {
  return user?.location?.city ? `${user.location.city}, ${user.location.country}` : 'No location';
}
