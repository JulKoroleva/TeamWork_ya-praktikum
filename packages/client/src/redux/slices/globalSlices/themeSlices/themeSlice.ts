import { createSlice } from '@reduxjs/toolkit';
import { getTheme } from '@/redux/requests';
import { IThemeSlice } from './themeSlice.interface';

const initialState: IThemeSlice = {
  darkTheme: false,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    clearThemeState: state => {
      state.darkTheme = false;
    },
  },
  extraReducers: builder => {
    builder.addCase(getTheme.fulfilled, (state, action) => {
      state.darkTheme = action.payload.darkTheme;
    });
  },
});

export const { clearThemeState } = themeSlice.actions;
