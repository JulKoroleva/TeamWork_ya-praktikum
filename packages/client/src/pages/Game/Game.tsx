import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Popup, UniversalModal } from '@/components';
import {
  EndGame,
  StartGame,
  CanvasComponent,
  GoBackModalContent,
  MODAL_CONTENT,
} from './components';
import { TResult } from './Game.interface';
import { ROUTES } from '@/constants/routes';
import { addLeaderBoardEntry } from '@/redux/requests';
import { RootState, TypeDispatch } from '@/redux/store';
import { getCookie } from '@/services/cookiesHandler';
import { useIsAuthorized, usePage } from '@/services/hooks';
import { initPage } from '@/routes';

export const Game = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<TypeDispatch>();
  const [isAuthorized, setIsAuthorized] = useIsAuthorized();
  const playerInfo = useSelector((state: RootState) => state.global.user.userInfo);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [result, setResult] = useState<Array<Array<TResult>>>([]);
  const [isEndedGame, setEndedGame] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const authCookie = getCookie('auth');

  useEffect(() => {
    setIsAuthorized(!!authCookie);
  }, [authCookie]);

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  const handleEndGame = async (result: Array<TResult> = []) => {
    setResult(prev => [result, ...prev]);
    setEndedGame(true);
    const scorePoints = result.find(res => res.title === 'Score Points')?.value || 0;

    const leaderboardData = {
      username: playerInfo?.display_name || playerInfo?.first_name || 'Guest',
      scoredominators: scorePoints,
      id: playerInfo?.id || 0,
    };

    if (isAuthorized) {
      await dispatch(addLeaderBoardEntry(leaderboardData));
    }
  };

  const handleRepeat = () => {
    setEndedGame(false);
    setIsGameStarted(false);
    setShowModal(false);
    setIsPaused(false);
  };

  const handleBackButtonClick = () => {
    setShowModal(true);
    setIsPaused(true);
  };

  const confirmNavigation = () => {
    setShowModal(false);
    navigate(ROUTES.main());
  };

  const cancelNavigation = () => {
    setShowModal(false);
    setIsPaused(false);
  };

  usePage({ initPage });

  return (
    <>
      {!isGameStarted ? (
        <StartGame onComplete={handleStartGame} isGameStarted={isGameStarted} />
      ) : (
        <>
          <UniversalModal
            //!isEndedGame нужно, чтобы не открывать модалку во время конца игры при окончании захвата мыши
            show={showModal && !isEndedGame}
            onHide={cancelNavigation}
            title={MODAL_CONTENT.modalTitle}>
            <GoBackModalContent
              onConfirm={confirmNavigation}
              onCancel={cancelNavigation}
              modalContent={MODAL_CONTENT}
            />
          </UniversalModal>
          <CanvasComponent
            endGameCallback={handleEndGame}
            onBackButtonClick={handleBackButtonClick}
            isPaused={isPaused}
            isEndedGame={isEndedGame}
          />

          <Popup open={isEndedGame} withOverlay={true}>
            <EndGame results={result[0]} handleRepeat={handleRepeat} />
          </Popup>
        </>
      )}
    </>
  );
};
