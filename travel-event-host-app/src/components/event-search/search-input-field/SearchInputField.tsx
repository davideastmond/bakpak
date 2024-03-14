'use client';
import { CustomTextField } from '@/components/custom-fields/CustomFields';
import Divider from '@mui/material/Divider';
import Image from 'next/image';
import { useState } from 'react';
import styles from '../styles.module.css';

export function SearchInputField({
  handleSearch,
  keyword,
  fullWidth,
  placeholder,
}: {
  handleSearch: (searchInput: string) => void;
  keyword: string;
  fullWidth?: boolean;
  placeholder?: string;
}) {
  const [searchInput, setSearchInput] = useState<string>(keyword);

  return (
    <CustomTextField
      onKeyDown={(e) => (e.key === 'Enter' ? handleSearch(searchInput) : null)}
      inputProps={{
        style: {
          paddingRight: 0,
        },
      }}
      fullWidth={fullWidth}
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value as string)}
      placeholder={placeholder}
      sx={{ fontSize: '2em', flexGrow: 1, '& .MuiInputBase-root': { backgroundColor: 'white' } }}
      InputProps={{
        endAdornment: (
          <div onClick={() => handleSearch(searchInput)} className={styles.searchBtn}>
            <Divider
              sx={{ borderRightWidth: '2px', margin: '.5em 1em', marginLeft: 0 }}
              orientation='vertical'
              flexItem
            />
            <Image
              alt='search'
              src='/images/search event/search-svgrepo-com.svg'
              width={19}
              height={19}
            />
          </div>
        ),
      }}
      id='input-with-icon-adornment'
    ></CustomTextField>
  );
}
