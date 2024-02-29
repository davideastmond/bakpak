import {
  profileFormHeaderSizes,
  textInputFieldFontSizes,
  textInputFieldHeights,
  textInputPaddings,
} from '@/app/common-styles/form-field-sizes';
import theme from '@/app/theme';
import { Category } from '@/lib/category';
import { CategoryDict } from '@/lib/category-dictionary';
import { UserEvent } from '@/models/user-event';
import { Box, Button, Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';
import Image from 'next/image';
import React, { useState } from 'react';
import styles from '../../app/common-styles/checkbox-group-styles.module.css';
import { ErrorComponent } from '../ErrorComponent/ErrorComponent';
import { AddressAutocomplete } from '../address-autocomplete/AddressAutocomplete';
import { CalendarPicker } from '../calendar-picker/CalendarPicker';
import { CheckboxGroup } from '../checkbox-group/CheckboxGroup';
import { generateInitialCheckboxStateFromArray } from '../checkbox-group/utils/generate-initial-checkbox-state';
import { getCheckedElements } from '../checkbox-group/utils/get-checked-elements';
import { CommonButton } from '../common-button/Common-Button';
import { CustomTextField, StyledFormFieldSection } from '../custom-fields/CustomFields';
import { EventUpdateData } from '../event-editor/event-update-data';
import { ImagePicker } from '../image-picker/ImagePicker';
import { SampleImageLoader } from '../image-picker/utils/sample-image-loader';
import { Spinner } from '../spinner/Spinner';

// Think how this component can be reused in other parts of the app

interface EventFormFieldsProps {
  isLoading?: boolean;
  errors?: Record<string, string[]>;
  eventContext?: UserEvent;
  onSubmission?: (updateData: EventUpdateData) => void;
}

export function EventFormFields({
  errors,
  isLoading,
  eventContext,
  onSubmission,
}: EventFormFieldsProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(eventContext?.imageUrl || null); // This should be url
  const [formattedAddress, setFormattedAddress] = useState<string | null>(
    eventContext?.location.formattedAddress || '',
  );
  // Checkbox state needs to be rendered based on the current categories in the event context
  const [categoryCheckboxesState, setCategoryCheckboxesState] = useState<{
    [key in string]: boolean;
  }>(generateInitialCheckboxStateFromArray(eventContext?.categories || [], Category));

  const [formValues, setFormValues] = useState<
    Record<string, string | dayjs.Dayjs | google.maps.places.PlaceResult | null | File>
  >({
    title: eventContext?.title || '',
    description: eventContext?.description || '',
    startDate: dayjs(eventContext?.startDate) || null,
    endDate: dayjs(eventContext?.endDate) || null,
    imageUrl: eventContext?.imageUrl || null,
    imageFile: null,
    geocoderResult: null,
  });

  const handleInputChanged = (e: any) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEventImageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    SampleImageLoader.load(e, setFormValues, setImagePreview);
  };

  // Send the data back to parent. Validation will happen in the parent component
  const handleSubmitUpdate = () => {
    const updateData: EventUpdateData = {
      title: formValues.title as string,
      description: formValues.description as string,
      startDate: formValues.startDate as dayjs.Dayjs,
      endDate: formValues.endDate as dayjs.Dayjs,
      imageUrl: formValues.imageUrl as string,
      geocoderResult: formValues.geocoderResult as google.maps.places.PlaceResult,
      categories: getCheckedElements(categoryCheckboxesState),
      imageFile: formValues.imageFile as File,
    };

    onSubmission && onSubmission(updateData);
  };
  if (isLoading) return <Spinner />;
  return (
    <form>
      <StyledFormFieldSection>
        <Typography
          color={theme.palette.primary.thirdColorIceLight}
          sx={{
            fontSize: profileFormHeaderSizes,
          }}
        >
          Title
        </Typography>
        <CustomTextField
          autoComplete='title'
          fullWidth
          id='title'
          inputProps={{ maxLength: 155 }}
          name='title'
          onChange={handleInputChanged}
          placeholder='Event Title'
          required
          type='text'
          value={formValues.title}
          sx={{
            '&&& input': {
              height: textInputFieldHeights,
              padding: textInputPaddings,
            },
            fontSize: textInputFieldFontSizes,
          }}
        />
        <ErrorComponent fieldName='title' errors={errors!} />
      </StyledFormFieldSection>
      <StyledFormFieldSection>
        <Typography
          color={theme.palette.primary.thirdColorIceLight}
          sx={{
            fontSize: profileFormHeaderSizes,
          }}
        >
          Description
        </Typography>
        <CustomTextField
          autoComplete='description'
          fullWidth
          id='description'
          inputProps={{ maxLength: 255 }}
          maxRows={3}
          minRows={3}
          multiline
          name='description'
          onChange={handleInputChanged}
          placeholder='Event Description'
          required
          type='text'
          value={formValues.description}
          sx={{
            '&&& input': {
              height: textInputFieldHeights,
              fontSize: textInputFieldFontSizes,
              padding: textInputPaddings,
            },
            '&.MuiFormControl-root': {
              backgroundColor: 'white',
            },
          }}
        />
        <ErrorComponent fieldName='description' errors={errors!} />
      </StyledFormFieldSection>
      <StyledFormFieldSection>
        <Box
          display='flex'
          width={'100%'}
          gap={2}
          justifyContent={'space-between'}
          sx={{
            [theme.breakpoints.down('md')]: {
              flexDirection: 'column',
            },
          }}
        >
          <Box>
            <Typography
              color={theme.palette.primary.thirdColorIceLight}
              sx={{
                fontSize: profileFormHeaderSizes,
                alignContent: 'center',
              }}
            >
              Event Starts
            </Typography>
            <CalendarPicker
              containerStyles={{ marginTop: 1 }}
              value={formValues.startDate as dayjs.Dayjs}
              onDateTimeChange={(date) => setFormValues((prev) => ({ ...prev, startDate: date }))}
              disablePast={true}
            />
            <ErrorComponent fieldName='startDate' errors={errors!} />
          </Box>
          <Box>
            <Typography
              color={theme.palette.primary.thirdColorIceLight}
              sx={{
                fontSize: profileFormHeaderSizes,
              }}
            >
              Event Ends
            </Typography>
            <CalendarPicker
              containerStyles={{ marginTop: 1 }}
              value={formValues.endDate as dayjs.Dayjs}
              onDateTimeChange={(date) => setFormValues((prev) => ({ ...prev, endDate: date }))}
              minDate={formValues.startDate as dayjs.Dayjs}
            />
            <ErrorComponent fieldName='endDate' errors={errors!} />
          </Box>
        </Box>
      </StyledFormFieldSection>
      <StyledFormFieldSection>
        <Box id='categories-section'>
          <Typography
            color={theme.palette.primary.thirdColorIceLight}
            sx={{
              fontSize: profileFormHeaderSizes,
              mb: 1,
            }}
          >
            Tag the event with categories
          </Typography>
          <CheckboxGroup
            state={categoryCheckboxesState}
            dictionary={CategoryDict}
            setStateFunction={setCategoryCheckboxesState}
            customStyles={styles.checkboxGroup}
          />
        </Box>
      </StyledFormFieldSection>
      <Divider sx={{ borderColor: theme.palette.primary.thirdColorIceLight }} />
      <StyledFormFieldSection sx={{ mt: 2, mb: 2 }}>
        <Box>
          <Typography
            color={theme.palette.primary.thirdColorIceLight}
            sx={{
              fontSize: profileFormHeaderSizes,
              mb: 1,
            }}
          >
            Where is this event taking place?
          </Typography>
          <Typography
            color={theme.palette.primary.thirdColorIceLight}
            sx={{
              fontSize: textInputFieldFontSizes,
              mb: 1,
            }}
          >
            {formattedAddress}
          </Typography>

          <AddressAutocomplete
            componentName={'geocoderResult'}
            placeholder='Update location...'
            onLocationSelected={(location) => {
              setFormValues((prev) => ({
                ...prev,
                geocoderResult: location as google.maps.places.PlaceResult,
              }));
              setFormattedAddress(location.formatted_address as string);
            }}
          />
          <ErrorComponent fieldName='geocoderResult' errors={errors!} />
        </Box>
      </StyledFormFieldSection>
      <Divider sx={{ borderColor: theme.palette.primary.thirdColorIceLight }} />
      <StyledFormFieldSection mt={2}>
        {imagePreview && (
          <Box id='event-image-container'>
            <Box>
              <Typography
                color={theme.palette.primary.thirdColorIceLight}
                sx={{
                  fontSize: profileFormHeaderSizes,
                }}
              >
                Event image
              </Typography>
            </Box>
            {imagePreview ? (
              <Image src={imagePreview} alt='Event Image' height={169} width={300} />
            ) : (
              <Box>
                <Typography>No image</Typography>
              </Box>
            )}
          </Box>
        )}
        <Box maxWidth={'300px'} id='event-image-container'>
          <Box display='flex' gap={1} mt={1}>
            <ImagePicker
              buttonTitle={eventContext?.imageUrl ? 'Replace image...' : 'Select an image...'}
              onImageSelected={handleEventImageChanged}
              containerProps={{ display: 'block' }}
              buttonTypographyProps={textInputFieldFontSizes}
              buttonProps={{ padding: '5px' }}
            />
            {eventContext?.imageUrl && (
              <Button
                onClick={() => {
                  setFormValues((prev) => ({ ...prev, imageUrl: null }));
                  setImagePreview(null);
                }}
              >
                <Typography sx={{ color: theme.palette.primary.burntOrangeCancelError }}>
                  Delete image
                </Typography>
              </Button>
            )}
          </Box>
        </Box>
      </StyledFormFieldSection>
      <StyledFormFieldSection>
        {isLoading ? (
          <Spinner />
        ) : (
          <Box id='user-actions' mt={5} display='flex' gap={3} justifyContent={'right'}>
            <Button sx={{ textTransform: 'none' }}>
              <Typography sx={{ color: theme.palette.primary.burntOrangeCancelError }}>
                Cancel
              </Typography>
            </Button>
            <CommonButton
              variant='outlined'
              label='Update'
              borderColor={theme.palette.primary.greenConfirmation}
              textColor={theme.palette.primary.greenConfirmation}
              onButtonClick={handleSubmitUpdate}
              borderRadius={'2px'}
              borderWidth={'1px'}
              disabled={isLoading}
            />
          </Box>
        )}
      </StyledFormFieldSection>
    </form>
  );
}
