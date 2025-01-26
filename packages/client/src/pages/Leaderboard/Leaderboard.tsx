import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ErrorNotification, Loader, UniversalModal } from '@/components';
import { LeaderBoardItem } from './components';
import { ROUTES } from '@/constants/routes';
import { HEADERS } from '@/constants/headers';
import styles from './Leaderboard.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchLeaderBoard } from '@/redux/requests/pagesRequests/leaderBoardRequest/leaderBoardRequest';
import { RootState, TypeDispatch } from '@/redux/store';
import { getCookie } from '@/services/cookiesHandler';
import { usePage } from '@/services/hooks';
import { initPage } from '@/routes';

export const Leaderboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<TypeDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.leaderboard);

  const authCookie = getCookie('auth');

  useEffect(() => {
    dispatch(fetchLeaderBoard({ ratingFieldName: 'scoredominators', cursor: 0, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (!authCookie) {
      navigate(ROUTES.authorization());
    }
  }, [authCookie]);

  usePage({ initPage });

  if (loading === 'loading')
    return (
      <div className={styles['loader-container']}>
        <Loader />
      </div>
    );

  if (error)
    return (
      <UniversalModal
        show={!!error}
        onHide={() => {
          navigate(ROUTES.main());
        }}
        status="failed"
        title={error}
        zIndex={2000}></UniversalModal>
    );

  return (
    <div className={styles['leaderboard-page']}>
      <div className={styles['form-container']}>
        <ErrorNotification>
          <h1 className={styles['leaderboard-page__title']}>{HEADERS.leaderboard}</h1>
          <div className={styles['leaderboard-page__list']}>
            {data.length > 0 ? (
              data.map((item, index) => (
                <LeaderBoardItem
                  key={index}
                  item={{
                    id: item.data.id,
                    userId: item.data.id,
                    rank: index + 1,
                    userName: item.data.username,
                    score: item.data.scoredominators,
                  }}
                />
              ))
            ) : (
              <div className={styles['leaderboard-page__list_empty']}>Champions on the way</div>
            )}
          </div>
        </ErrorNotification>
        <Button
          className={styles['back-button']}
          type="button"
          variant="primary"
          onClick={() => navigate(ROUTES.main())}>
          Back
        </Button>
      </div>
    </div>
  );
};
