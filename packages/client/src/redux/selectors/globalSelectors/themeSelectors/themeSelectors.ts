import { RootState } from '@/redux/store';

export const selectTheme = (state: RootState) => state.global.theme.darkTheme;
