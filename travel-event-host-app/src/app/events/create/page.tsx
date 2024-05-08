'use client';
import { EventClient } from '@/app/clients/event/event-client';
import {
  profileFormHeaderSizes,
  textInputFieldFontSizes,
  textInputFieldHeights,
  textInputPaddings,
} from '@/app/common-styles/form-field-sizes';
import { getLocationPostDataFromGeocoderResult } from '@/app/integration/google-maps-api/address-helper';
import { extractCoords } from '@/app/integration/google-maps-api/extract-coords';
import {
  GoogleMapsTimezoneData,
  TimezoneRequestor,
} from '@/app/integration/google-maps-api/timezone-requestor';
import { ImageType, SpacesImageInteractor } from '@/app/integration/utils/spaces-image-interactor';
import theme from '@/app/theme';
import { ErrorComponent } from '@/components/ErrorComponent/ErrorComponent';
import { AddressAutocomplete } from '@/components/address-autocomplete/AddressAutocomplete';
import { CalendarPicker } from '@/components/calendar-picker/CalendarPicker';
import { CheckboxGroup } from '@/components/checkbox-group/CheckboxGroup';

import { generateInitialCheckboxState } from '@/components/checkbox-group/utils/checkbox-state-utils';
import { getCheckedElements } from '@/components/checkbox-group/utils/get-checked-elements';
import { CommonButton } from '@/components/common-button/Common-Button';
import { CustomTextField, StyledFormFieldSection } from '@/components/custom-fields/CustomFields';
import { ImagePicker } from '@/components/image-picker/ImagePicker';
import { SampleImageLoader } from '@/components/image-picker/utils/sample-image-loader';
import { Spinner } from '@/components/spinner/Spinner';
import { IAppActionType, useAppContext } from '@/lib/app-context';
import { useAuthContext } from '@/lib/auth-context';

import { AuthStatus } from '@/lib/definitions/auth-status';
import { Category } from '@/lib/definitions/category';
import { CategoryDict } from '@/lib/definitions/category-dictionary';
import {
  eventCreateValidationSchema,
  eventCreationCategoriesSchema,
} from '@/lib/yup-validators/event/event-create-validation.schema';
import { extractValidationErrors } from '@/lib/yup-validators/utils/extract-validation-errors';
import { Loader } from '@googlemaps/js-api-loader';
import { Backdrop, Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '../../common-styles/checkbox-group-styles.module.css';
import { geocoderResultValidationSchema } from './validators/geocoder-result-validation-schema';

/**
 Event creation page. Only authenticated users can create events. If the user is not authenticated, redirect to the login page.
 */

interface CreateEventPageFormValues {
  title: string;
  description: string;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  imageFile: File | null;
  geocoderResult: google.maps.GeocoderResult | null;
  timezoneResult: GoogleMapsTimezoneData | null;
}

// Google maps loader
const mapLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
  version: 'weekly',
  libraries: ['places', 'maps'],
});

export default function CreateEventPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [googleMap, setGoogleMap] = useState<google.maps.Map | undefined>(undefined);
  const [mapMarker, setMapMarker] = useState<google.maps.marker.AdvancedMarkerElement | undefined>(
    undefined,
  );

  // This is the state that holds the checked status of the category checkboxes
  // I separated it from the formValues state because it's a different type of state
  // Maybe we can combine them into one state if we can figure out a way to do it
  const [categoryCheckboxesState, setCategoryCheckboxesState] = useState<{
    [key in string]: boolean;
  }>(generateInitialCheckboxState(Category));

  const [formValues, setFormValues] = useState<CreateEventPageFormValues>({
    title: '',
    description: '',
    startDate: dayjs(),
    endDate: dayjs(),
    imageFile: null,
    geocoderResult: null,
    timezoneResult: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { status, session } = useAuthContext();
  const router = useRouter();
  const { appDispatch } = useAppContext();
  // Load a map
  useEffect(() => {
    let mapOptions: any;
    appDispatch!({ type: IAppActionType.SET_IDLE });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapOptions = {
          center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          zoom: 15,
          mapId: 'googleMapEventLocation',
        };
        loadMap(mapOptions);
      },
      (error) => {
        mapOptions = {
          center: {
            lat: 0,
            lng: 0,
          },
          zoom: 15,
          mapId: 'googleMapEventLocation',
        };
        loadMap(mapOptions);
      },
    );
  }, []);

  const loadMap = async (mapOptions: google.maps.MapOptions) => {
    const { Map } = await mapLoader.importLibrary('maps');
    const { AdvancedMarkerElement } = await mapLoader.importLibrary('marker');

    const mapObject = new Map(
      document.getElementById('googleMapEventLocation') as HTMLElement,
      mapOptions,
    );

    setGoogleMap(mapObject);
    // Create a marker for the event location
    const marker = new AdvancedMarkerElement({
      position: mapOptions.center,
      map: mapObject,
      title: formValues.title || 'New event',
    });
    setMapMarker(marker);
  };

  const handleInputChanged = (e: any) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEventImageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    SampleImageLoader.load(e, setFormValues, setImagePreview);
  };

  const handleSubmitCreateEvent = async () => {
    // Client-side validation of the location (the google geocoder data can't be empty)
    setIsLoading(true);
    try {
      geocoderResultValidationSchema.validateSync(formValues, { abortEarly: false });
    } catch (err: any) {
      const extractedErrors = extractValidationErrors(err);
      setErrors(extractedErrors);
      return;
    }

    console.info('Gathering form values...');
    let data: any = {
      ...formValues,
      // Convert the date to ISODateString
      startDate: formValues.startDate?.toISOString()!,
      endDate: formValues.endDate?.toISOString(),
      categories: getCheckedElements(categoryCheckboxesState),
      location: {
        ...getLocationPostDataFromGeocoderResult(formValues.geocoderResult!),
        timezone: {
          id: formValues.timezoneResult?.timeZoneId,
          name: formValues.timezoneResult?.timeZoneName,
        },
      },
    };

    try {
      eventCreateValidationSchema.validateSync(data, { abortEarly: false });
      eventCreationCategoriesSchema.validateSync(data, { abortEarly: false });
    } catch (err: any) {
      console.error(err);
      setErrors(extractValidationErrors(err));
      return;
    }

    if (formValues.imageFile) {
      try {
        const cdnResolvePath: string = await SpacesImageInteractor.upload({
          file: formValues.imageFile,
          imageType: ImageType.EVENT,
          objectNameSeed: session?.user?._id,
        });
        data = {
          ...data,
          imageUrl: cdnResolvePath,
        };
      } catch (e: any) {
        console.error('Error uploading image', e.message);
      }
    }

    try {
      const res = await EventClient.postCreateEvent(data);
      console.info('Event posted to API...redirecting to event page', res._id);
      router.push(`/events/${res._id}`);
    } catch (e: any) {
      console.error('Error creating event', e.message);
      setErrors({ apiError: [e.message] });
      setIsLoading(false);
    }
  };

  const handleOnLocationSelected = async (geocoderResult: google.maps.places.PlaceResult) => {
    if (geocoderResult.geometry) {
      console.debug('geocoder result geometry', geocoderResult.geometry);
      const coords = extractCoords(geocoderResult.geometry as google.maps.GeocoderGeometry);
      const unixTimestamp = formValues.startDate?.unix() || Date.now() / 1000;
      const timezoneData = await TimezoneRequestor.getTimezoneByCoords(coords, unixTimestamp);

      setGoogleMap((prev) => {
        if (prev) {
          prev.setCenter(coords);
        }

        new google.maps.marker.AdvancedMarkerElement({
          position: geocoderResult.geometry?.location,
          map: prev,
        });

        return prev;
      });
      setMapMarker((prev) => {
        (prev as any).setMap(null);
        return prev;
      });
      setFormValues((prev) => ({
        ...prev,
        geocoderResult: geocoderResult as any,
        timezoneResult: timezoneData,
      }));
    }
  };

  if (status === AuthStatus.Unauthenticated) {
    return router.replace('/auth/signin');
  }

  return (
    <Box
      p={'5%'}
      className='eventCreateMain'
      sx={{
        [theme.breakpoints.down('md')]: {
          padding: 0,
          mt: 5,
        },
      }}
      marginLeft={[0, '10%', '15%', '20%', '30%']}
      marginRight={[0, '10%', '15%', '20%', '30%']}
    >
      <Backdrop open={isLoading}>
        <Spinner />
      </Backdrop>
      <Box
        className='eventCreate_styledForm'
        width={'100%'}
        sx={{ bgcolor: theme.palette.primary.secondaryColorDarkBlack }}
        p={5}
      >
        <Box>
          <Typography
            fontSize={['1.2rem', '1.8rem']}
            color={theme.palette.primary.thirdColorIceLight}
            sx={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}
          >
            Create an event
          </Typography>
        </Box>
        <form>
          <StyledFormFieldSection>
            <Typography
              color={theme.palette.primary.thirdColorIceLight}
              sx={{
                fontWeight: 'bold',
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
            <ErrorComponent fieldName='title' errors={errors} />
          </StyledFormFieldSection>
          <StyledFormFieldSection>
            <Typography
              color={theme.palette.primary.thirdColorIceLight}
              sx={{
                fontWeight: 'bold',
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
            <ErrorComponent fieldName='description' errors={errors} />
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
                    fontWeight: 'bold',
                    fontSize: profileFormHeaderSizes,
                    alignContent: 'center',
                  }}
                >
                  Event Starts
                </Typography>
                <CalendarPicker
                  containerStyles={{ marginTop: 1 }}
                  value={formValues.startDate}
                  onDateTimeChange={(date) =>
                    setFormValues((prev) => ({ ...prev, startDate: date }))
                  }
                  disablePast={true}
                />
                <ErrorComponent fieldName='startDate' errors={errors} />
              </Box>
              <Box>
                <Typography
                  color={theme.palette.primary.thirdColorIceLight}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: profileFormHeaderSizes,
                  }}
                >
                  Event Ends
                </Typography>
                <CalendarPicker
                  containerStyles={{ marginTop: 1 }}
                  value={formValues.endDate}
                  onDateTimeChange={(date) => setFormValues((prev) => ({ ...prev, endDate: date }))}
                  minDate={formValues.startDate!}
                />
                <ErrorComponent fieldName='endDate' errors={errors} />
              </Box>
            </Box>
          </StyledFormFieldSection>

          <StyledFormFieldSection sx={{ mt: 2, mb: 2 }}>
            <Box id='googleMapEventLocation' sx={{ height: '300px', width: '100%' }} />
            <Box mt={2}>
              <Typography
                color={theme.palette.primary.thirdColorIceLight}
                sx={{
                  fontSize: profileFormHeaderSizes,
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
                Where is this event taking place?
              </Typography>
              <AddressAutocomplete
                componentName={'geocoderResult'}
                onLocationSelected={handleOnLocationSelected}
              />
              <ErrorComponent fieldName='geocoderResult' errors={errors} />
            </Box>
          </StyledFormFieldSection>
          <StyledFormFieldSection>
            {/* Timezone section here is readonly */}
            <Typography
              color={theme.palette.primary.thirdColorIceLight}
              sx={{
                fontSize: profileFormHeaderSizes,
                alignContent: 'center',
                fontWeight: 'bold',
              }}
            >
              Time zone
            </Typography>
            <Typography
              color={theme.palette.primary.thirdColorIceLight}
              sx={{
                fontSize: textInputFieldFontSizes,
                mb: 1,
              }}
            >
              {(formValues.timezoneResult as GoogleMapsTimezoneData)?.timeZoneName || ''}
            </Typography>
          </StyledFormFieldSection>

          <StyledFormFieldSection>
            <Box id='categories-section'>
              <Typography
                color={theme.palette.primary.thirdColorIceLight}
                sx={{
                  fontWeight: 'bold',
                  fontSize: profileFormHeaderSizes,
                  mb: 1,
                }}
              >
                Tag the event with categories (optional)
              </Typography>
              <CheckboxGroup
                state={categoryCheckboxesState}
                dictionary={CategoryDict}
                setStateFunction={setCategoryCheckboxesState}
                customStyles={styles.checkboxGroup}
              />
            </Box>
          </StyledFormFieldSection>
          <StyledFormFieldSection>
            {imagePreview && (
              <Box id='event-image-container'>
                <Image src={imagePreview} alt='Event Image' height={169} width={300} />
              </Box>
            )}
            <Box maxWidth={'300px'} id='event-image-container'>
              <Typography
                color={theme.palette.primary.thirdColorIceLight}
                sx={{
                  fontWeight: 'bold',
                  fontSize: profileFormHeaderSizes,
                }}
              >
                Upload an image (optional)
              </Typography>
              <Box>
                <ImagePicker
                  buttonTitle='Choose Image'
                  onImageSelected={handleEventImageChanged}
                  containerProps={{ display: 'block' }}
                  buttonTypographyProps={textInputFieldFontSizes}
                  buttonProps={{ padding: '5px' }}
                />
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
                  label='Create Event'
                  borderColor={theme.palette.primary.greenConfirmation}
                  textColor={theme.palette.primary.greenConfirmation}
                  onButtonClick={handleSubmitCreateEvent}
                  borderRadius={'2px'}
                  borderWidth={'1px'}
                  disabled={isLoading}
                />
              </Box>
            )}
          </StyledFormFieldSection>
        </form>
        <Box>
          <ErrorComponent fieldName='geocoderResult' errors={errors} />
          <ErrorComponent fieldName='apiError' errors={errors} />
        </Box>
      </Box>
    </Box>
  );
}
