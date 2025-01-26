import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadFull } from 'tsparticles';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { Container } from '@tsparticles/engine';

import { ErrorNotification } from '@/components';
import { Button } from 'react-bootstrap';

import { TypeDispatch } from '@/redux/store';
import { logoutRequest } from '@/redux/requests';
import { selectUser } from '@/redux/selectors';
import { clearUserState } from '@/redux/slices';

import { IParticle, IButtonConfig } from './Main.interface';

import { ROUTES } from '@/constants/routes';
import { HEADERS } from '@/constants/headers';
import { COLOR_PALETTE } from './constants/color.constant';
import { initPage } from '@/routes';

import { deleteCookie, getCookie } from '@/services/cookiesHandler';
import { useIsAuthorized, usePage } from '@/services/hooks';

import styles from './Main.module.scss';

export const Main = () => {
  // /**
  //  * ВРЕМЕННО. УБРАТЬ В GAME-30. До полноценной настройки SRR на клиенте возникает ошибка document is undefined.
  //  * Т.К. мы идём за куки до того, как документ отрендерился. фиксится в уроке 7/12 SSR */

  // Остаётся на 9 спринт в соответствии с задачей, так как в задаче GAME-30 указано, что регистрация по куке будет производиться именно в 9 спринте.
  if (typeof window === 'undefined') {
    return <></>;
  }
  const navigate = useNavigate();
  const dispatch = useDispatch<TypeDispatch>();

  const containerRef = useRef<Container | null>(null);

  const [init, setInit] = useState(false);
  const [isAuthorized, setIsAuthorized] = useIsAuthorized();

  const userInfo = useSelector(selectUser);

  const description =
    'Сражайся, поглощай и становись сильнее! Уничтожай соперников в динамичной битве за выживание.';

  const buttons: IButtonConfig[] = [
    { href: ROUTES.game(), text: 'Start Game!', className: styles[`main-button`] },
    { href: ROUTES.profile(), text: 'Profile' },
    { href: ROUTES.leaderboard(), text: 'Leaderboard' },
    { href: ROUTES.forum(), text: 'Forum' },
  ];

  const authCookie = getCookie('auth');

  useEffect(() => {
    const initializeParticles = async () => {
      try {
        await initParticlesEngine(async engine => {
          await loadFull(engine);
        });
        setInit(true);
      } catch (error) {
        console.error('Error initializing particles engine:', error);
      }
    };

    if (!init) {
      initializeParticles();
    }
  }, [init]);

  const particlesConfig = useMemo(
    () => ({
      fullScreen: { zIndex: -1 },
      particles: {
        number: { value: 80 },
        color: { value: COLOR_PALETTE },
        shape: { type: 'circle' },
        opacity: { value: 1 },
        size: { value: { min: 5, max: 25 } },
        collisions: { enable: true, mode: 'bounce' as const },
        move: {
          enable: true,
          speed: 3,
          direction: 'none' as const,
          outModes: 'bounce' as const,
        },
      },
    }),
    [],
  );

  const handleCollision = useCallback((container: Container) => {
    if (!container) return;

    const particlesArray: IParticle[] =
      (container as unknown as { particles: { _array: IParticle[] } }).particles?._array || [];

    if (!particlesArray || particlesArray.length === 0) return;

    for (let i = 0; i < particlesArray.length; i++) {
      for (let j = i + 1; j < particlesArray.length; j++) {
        const p1 = particlesArray[i];
        const p2 = particlesArray[j];

        const dx = p1.position.x - p2.position.x;
        const dy = p1.position.y - p2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= p1.getRadius() + p2.getRadius()) {
          const larger = p1.getRadius() > p2.getRadius() ? p1 : p2;
          const smaller = p1.getRadius() > p2.getRadius() ? p2 : p1;

          const growth = smaller.size.value * 0.2;
          larger.size.value += growth;

          smaller.destroy();

          const index = particlesArray.indexOf(smaller);
          if (index > -1) {
            particlesArray.splice(index, 1);
          }
        }
      }
    }
  }, []);

  const particlesLoaded = useCallback(
    async (container?: Container) => {
      if (!container) return;
      containerRef.current = container;

      const intervalId = setInterval(() => handleCollision(containerRef.current!), 10);

      return new Promise<void>(resolve => {
        return () => {
          clearInterval(intervalId);
          resolve();
        };
      });
    },
    [handleCollision],
  );

  useEffect(() => {
    if (authCookie) {
      setIsAuthorized(true);
    }
  }, [authCookie]);

  usePage({ initPage });

  return (
    <div className={styles['main-page']}>
      <ErrorNotification>
        {init && (
          <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={particlesConfig} />
        )}
        <h1 className={styles['main-page__title']}>{HEADERS.main}</h1>
        <div className={styles['main-page__menu']}>
          <h3 className={styles['main-page__menu_greetings']}>
            Привет, {userInfo?.login || 'Guest'}!
          </h3>
          <p className={styles['main-page__menu_description']}>{description}</p>
          <div className={styles['main-page__menu_buttons']}>
            {buttons
              .filter(
                ({ href }) =>
                  isAuthorized || (href !== ROUTES.profile() && href !== ROUTES.leaderboard()),
              )
              .map(({ href, text, className }, index) => (
                <Button
                  key={index}
                  size="lg"
                  onClick={() => navigate(href)}
                  className={`${styles['menu-button']} ${className || ''}`.trim()}>
                  {text}
                </Button>
              ))}
          </div>
        </div>
        <Button
          className={styles['main-page__logout-button']}
          onClick={() => {
            if (isAuthorized) {
              dispatch(logoutRequest());
              dispatch(clearUserState());
              setIsAuthorized(false);
              deleteCookie('auth');
              return;
            }
            navigate(ROUTES.authorization());
          }}>
          {isAuthorized ? 'Log out' : 'Log in'}
        </Button>
      </ErrorNotification>
    </div>
  );
};
