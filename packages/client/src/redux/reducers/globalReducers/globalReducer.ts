import { combineReducers } from '@reduxjs/toolkit';

import { userSlice, themeSlice } from '@/redux/slices';
import { IGlobalReducer } from './globalReducer.interface';

export const globalReducer = combineReducers({
  user: userSlice.reducer,
  theme: themeSlice.reducer,
});

export type GlobalState = IGlobalReducer;
