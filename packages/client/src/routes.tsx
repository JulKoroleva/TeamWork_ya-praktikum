import {
  Authorization,
  Forum,
  Leaderboard,
  Main,
  Profile,
  Registration,
  Error,
  Game,
  Topic,
  initForumPage,
  OAuthTokenPage,
} from '@/pages';
import { ROUTES } from './constants/routes';
import { RootState, TypeDispatch } from './redux/store';
import { getTheme } from './redux/requests';

export const initPage = ({ dispatch }: PageInitArgs) => {
  const queue: Array<Promise<unknown>> = [dispatch(getTheme({ userId: 123 }))];
  return Promise.all(queue);
};

export const routes = [
  { path: ROUTES.authorization(), Component: Authorization, fetchData: initPage },
  { path: ROUTES.registration(), Component: Registration, fetchData: initPage },
  { path: ROUTES.main(), Component: Main, fetchData: initPage },
  { path: ROUTES.home(), Component: Main, fetchData: initPage },
  { path: ROUTES.game(), Component: Game, fetchData: initPage },
  { path: ROUTES.forum(), Component: Forum, fetchData: initForumPage },
  { path: ROUTES.leaderboard(), Component: Leaderboard, fetchData: initPage },
  { path: ROUTES.oAuthTokenPage(), Component: OAuthTokenPage, fetchData: initPage },
  { path: ROUTES.profile(), Component: Profile, fetchData: initPage },
  { path: ROUTES.error(':code'), Component: Error, fetchData: initPage },
  { path: ROUTES.topic(), Component: Topic, fetchData: initForumPage },
  { path: '*', Component: Error, fetchData: initPage },
];

export type PageInitArgs = {
  dispatch: TypeDispatch;
  state: RootState;
};
