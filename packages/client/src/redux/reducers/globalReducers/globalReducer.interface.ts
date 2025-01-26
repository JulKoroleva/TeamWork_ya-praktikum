import { IUserSlice, IThemeSlice } from '@/redux/slices';

export interface IGlobalReducer {
  user: IUserSlice;
  theme: IThemeSlice;
}
