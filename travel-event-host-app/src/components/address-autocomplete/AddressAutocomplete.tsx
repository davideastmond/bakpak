import { useState } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';
import { CustomTextField } from '../custom-fields/CustomFields';

interface AddressAutocompleteProps {
  onLocationSelected?: (place: google.maps.places.PlaceResult) => void;
  componentName: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  onLocationSelected,
  componentName,
  placeholder,
}: AddressAutocompleteProps) {
  const { ref: materialRef } = usePlacesWidget({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    inputAutocompleteValue: 'Start typing your location',
    options: {
      types: ['geocode', 'establishment'],
    },
    onPlaceSelected: (place: google.maps.places.PlaceResult) => {
      setTextFieldValue(place?.formatted_address!);
      onLocationSelected && onLocationSelected(place);
    },
  });

  const [textFieldValue, setTextFieldValue] = useState<string>('');

  return (
    <CustomTextField
      placeholder={placeholder || 'Start typing your location'}
      required
      id={componentName}
      name={componentName}
      type='text'
      autoComplete='location'
      fullWidth
      inputRef={materialRef}
      value={textFieldValue}
      onChange={(e) => {
        setTextFieldValue(e.target.value);
      }}
    />
  );
}
