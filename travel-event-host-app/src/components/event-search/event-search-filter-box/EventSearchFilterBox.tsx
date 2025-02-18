'use client';

import { CheckboxGroup } from '@/components/checkbox-group/CheckboxGroup';
import { CategoryDict } from '@/lib/category-dictionary';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { useState } from 'react';
import styles from '../styles.module.css';

export const EventSearchFilterBox = ({
  setCategories,
  categories,
  filterBoxIsOpen,
  setFilterBoxIsOpen,
}: {
  setCategories: React.Dispatch<React.SetStateAction<{ [key in string]: boolean }>>;
  categories: { [key in string]: boolean };
  filterBoxIsOpen: boolean;
  setFilterBoxIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [day, setDay] = useState('Any day');
  const [distance, setDistance] = useState('Any distance');

  const handleDayChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setDay(event.target.value);
  };

  const handleDistanceChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setDistance(event.target.value);
  };

  return (
    <div className={`${styles.filterBox} ${filterBoxIsOpen ? styles.open : ''}`}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRadius: 2,
          backgroundColor: 'white',
          padding: 4,
          color: 'black',
          position: 'sticky',
          minWidth: '274px',
          height: 'min-content',
          top: 0,
        }}
      >
        <IconButton
          className={styles.closeIcon}
          onClick={() => setFilterBoxIsOpen(false)}
          sx={{ alignSelf: 'flex-end' }}
        >
          <CloseIcon />
        </IconButton>
        <Select value={day} onChange={handleDayChange}>
          <MenuItem value='Any day'>Any day</MenuItem>
          <MenuItem value='Today'>Today</MenuItem>
          <MenuItem value='Tomorrow'>Tomorrow</MenuItem>
          <MenuItem value='This week'>This week</MenuItem>
          <MenuItem value='Next week'>Next week</MenuItem>
          <MenuItem value='Custom'>Custom</MenuItem>
        </Select>
        <Select value={distance} onChange={handleDistanceChange}>
          <MenuItem value='Any distance'>Any distance</MenuItem>
          <MenuItem value='100km'>100km</MenuItem>
          <MenuItem value='500km'>500km</MenuItem>
          <MenuItem value='1000km'>1000km</MenuItem>
        </Select>
        <Typography variant='h6'>Event Type</Typography>
        {/* Categories checkboxes here */}
        <CheckboxGroup
          state={categories}
          setStateFunction={setCategories}
          dictionary={CategoryDict}
          customStyles={styles.filterContainer}
        />
      </Box>
    </div>
  );
};
