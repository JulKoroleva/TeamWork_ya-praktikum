import { createAsyncThunk } from '@reduxjs/toolkit';

import { GET_USER_INFO_URL, RESOURCES_URL } from '@/constants/apiUrls';

import { extractTextFromImage } from '@/utils/colorFileUtils';
import { urlToFile } from '@/utils/urlToFile';

import { IUserInfo } from '@/redux/slices';

async function processUserAvatarSync(avatar: string): Promise<string> {
  try {
    const avatarUrl = `${RESOURCES_URL}${avatar}`;
    const avatarFile = await urlToFile(avatarUrl, 'avatar_image.jpg');
    const extractedColor = await extractTextFromImage(avatarFile);

    if (extractedColor) {
      return extractedColor;
    }

    return avatarUrl;
  } catch (error) {
    return `${RESOURCES_URL}${avatar}`;
  }
}

export const getUserInfoRequest = createAsyncThunk<
  { userInfo: IUserInfo; processedAvatar: string },
  void,
  { rejectValue: string }
>('user/getUserInfo', async (_, { rejectWithValue }) => {
  const request = await fetch(GET_USER_INFO_URL, {
    method: 'GET',
    credentials: 'include',
  });

  if (!request.ok) {
    const response = await request.json();
    const rejectReason = response.reason ? response.reason : 'Unknown error';
    return rejectWithValue(rejectReason);
  }

  const userInfo: IUserInfo = await request.json();

  let processedAvatar = '';
  if (userInfo.avatar) {
    processedAvatar = await processUserAvatarSync(userInfo.avatar);
  }

  return { userInfo, processedAvatar };
});
