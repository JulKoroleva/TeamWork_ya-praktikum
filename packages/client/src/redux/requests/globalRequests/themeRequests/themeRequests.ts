import { createAsyncThunk } from '@reduxjs/toolkit';
import { THEME_URL } from '@/constants/apiUrls';

export const getTheme = createAsyncThunk<
  { darkTheme: boolean },
  { userId: number },
  { rejectValue: string }
>('theme/getTheme', async (data, { rejectWithValue }) => {
  const request = await fetch(`${THEME_URL}/${data.userId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!request.ok) {
    const response = await request.json();
    const rejectReason = response.reason ? response.reason : 'Unknown error';
    return rejectWithValue(rejectReason);
  }

  const darkTheme: boolean = await request.json();

  return { darkTheme };
});
