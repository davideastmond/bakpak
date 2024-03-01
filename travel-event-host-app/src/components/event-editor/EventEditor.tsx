import { EventClient } from '@/app/clients/event/event-client';
import { geocoderResultValidationSchema } from '@/app/events/create/validators/geocoder-result-validation-schema';
import { getLocationPostDataFromGeocoderResult } from '@/app/integration/google-maps-api/address-helper';
import { ImageType, SpacesImageInteractor } from '@/app/integration/utils/spaces-image-interactor';
import theme from '@/app/theme';
import { useAuthContext } from '@/lib/auth-context';
import {
  eventCreateValidationSchema,
  eventCreationCategoriesSchema,
} from '@/lib/yup-validators/event/event-create-validation.schema';
import { extractValidationErrors } from '@/lib/yup-validators/utils/extract-validation-errors';
import { UserEvent } from '@/models/user-event';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { ErrorComponent } from '../ErrorComponent/ErrorComponent';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '../StyledDialog/StyledDialog';
import { EventFormFields } from '../event-form-fields/EventFormFields';
import { EventUpdateData } from './event-update-data';

interface EventEditorProps {
  open: boolean;
  onClose: () => void;
  onUpdateActionTaken?: () => void;
  eventContext: UserEvent;
}

export function EventEditor({
  open,
  onClose,
  eventContext,
  onUpdateActionTaken,
}: EventEditorProps) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [isLoading, setIsLoading] = useState(false);

  const { session } = useAuthContext();

  const handleEventEdit = async (data: EventUpdateData) => {
    const {
      title,
      description,
      startDate,
      endDate,
      imageUrl,
      geocoderResult,
      categories,
      imageFile,
    } = data;
    setIsLoading(true);
    let location = null; // This will hold the formatted location data to send to API if it's available

    if (geocoderResult !== null) {
      try {
        geocoderResultValidationSchema.validateSync({ geocoderResult }, { abortEarly: false });
        location = getLocationPostDataFromGeocoderResult(
          geocoderResult as google.maps.GeocoderResult,
        );
      } catch (e: any) {
        setErrors({ ...extractValidationErrors(e), apiError: ['There were errors.'] });
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    let baseValues: any = {
      title,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      categories,
      imageUrl, // If this is null it means the user deleted the image.
    };

    try {
      eventCreateValidationSchema.validateSync(baseValues, { abortEarly: false });
      eventCreationCategoriesSchema.validateSync(baseValues, { abortEarly: false });
    } catch (e: any) {
      setErrors({ ...extractValidationErrors(e), apiError: ['There were errors.'] });
      setIsLoading(false);
      return;
    }

    // If the imageFile is not null, upload the image and get the url
    if (imageFile) {
      try {
        const cdnResolvePath = await SpacesImageInteractor.upload({
          file: imageFile,
          objectNameSeed: session!.user!._id,
          imageType: ImageType.EVENT,
        });
        baseValues = { ...baseValues, imageUrl: cdnResolvePath };
      } catch (e: any) {
        console.log('Error uploading image', e.message);
      }
    }

    baseValues = { ...baseValues, location: location };

    try {
      await EventClient.patchEventById(eventContext._id, baseValues);
      onUpdateActionTaken && onUpdateActionTaken();
    } catch (e: any) {
      console.log('Error updating event', e.message);
      setIsLoading(false);
      setErrors({ ...errors, apiError: [`Error updating event: ${e.message}`] });
      return;
    }
  };

  return (
    <StyledDialog open={open}>
      <Box display='flex' justifyContent={'right'}>
        <IconButton onClick={() => onClose()}>
          <CloseIcon sx={{ color: theme.palette.primary.thirdColorIceLight }} />
        </IconButton>
      </Box>
      <StyledDialogTitle>
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
            Edit Event
          </Typography>
        </Box>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Box className='eventEditorForm'>
          <EventFormFields
            onCancel={() => onClose()}
            eventContext={eventContext}
            errors={errors}
            onSubmission={handleEventEdit}
          />
        </Box>
      </StyledDialogContent>
      <Box>
        {errors && (
          <Box mb={4} ml={3}>
            <ErrorComponent fieldName='apiError' errors={errors} />
          </Box>
        )}
      </Box>
    </StyledDialog>
  );
}
