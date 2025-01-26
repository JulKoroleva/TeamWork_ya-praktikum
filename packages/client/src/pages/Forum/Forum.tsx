import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';

import {
  FormComponent,
  Navigation,
  Popup,
  ErrorNotification,
  TModalStatus,
  IModalConfig,
  UniversalModal,
} from '@/components';
import { TopicList, Pagination, TPaginationOptions, TTopic } from './components';

import { TypeDispatch } from '@/redux/store';
import { createTopic, fetchForum, getTheme } from '@/redux/requests';
import {
  selectCreateTopicError,
  selectCreateTopicStatus,
  selectPaginationOptions,
  selectTopicList,
} from '@/redux/selectors';
import { clearForumState, clearForumStatus } from '@/redux/slices/pagesSlices/forumSlices';

import { useIsAuthorized, usePage } from '@/services/hooks';
import { getCookie } from '@/services/cookiesHandler';

import { ROUTES } from '@/constants/routes';
import { PageInitArgs } from '@/routes';
import { HEADERS } from '@/constants/headers';
import { createNewTopicFields, createNewTopicFieldsInitialValues } from './FormData';

import add from '@/assets/icons/add.svg';

import { ICreateTopicDto } from './components/TopicList/TopicList.interface';

import styles from './Forum.module.scss';

export const Forum = () => {
  // /**
  //  * ВРЕМЕННО. УБРАТЬ В GAME-30. До полноценной настройки SRR на клиенте возникает ошибка document is undefined.
  //  * Т.К. мы идём за куки до того, как документ отрендерился. фиксится в уроке 7/12 SSR */

  // Остаётся на 9 спринт в соответствии с задачей, так как в задаче GAME-30 указано, что регистрация по куке будет производиться именно в 9 спринте.
  if (typeof window === 'undefined') {
    return <></>;
  }
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [topicList, setTopicList] = useState<TTopic[]>([]);
  const [paginationOptions, setPaginationOptions] = useState<TPaginationOptions>({
    page: 1,
    total: 5,
    perPage: 5,
  });
  const [modalConfig, setModalConfig] = useState<IModalConfig>({
    show: false,
    header: '',
    status: undefined,
  });
  const [isAuthorized, setIsAuthorized] = useIsAuthorized();

  const authCookie = getCookie('auth');

  const topicListFromServer = useSelector(selectTopicList);
  const paginationOptionsFromServer = useSelector(selectPaginationOptions);
  const createTopicListStatus = useSelector(selectCreateTopicStatus);
  const createTopicListError = useSelector(selectCreateTopicError);
  const dispatch = useDispatch<TypeDispatch>();

  const onSubmit = (data: ICreateTopicDto) => {
    dispatch(createTopic(data));
    setIsOpen(false);
  };

  const handleCloseModal = () => {
    dispatch(clearForumStatus());
    setModalConfig({ show: false, header: '', status: undefined });
  };

  const handleChangePage = (newOptions: TPaginationOptions) => {
    setPaginationOptions(newOptions);
    dispatch(fetchForum({ pageNumber: newOptions.page }));
  };

  useEffect(() => {
    setIsAuthorized(!!authCookie);
  }, [authCookie]);

  useEffect(() => {
    setTopicList(topicListFromServer);
    setPaginationOptions(paginationOptionsFromServer);
  }, [topicListFromServer, paginationOptionsFromServer]);

  useEffect(() => {
    let header = '';
    let statusValue: TModalStatus = 'idle';
    let error: typeof createTopicListError = '';
    let succeeded = '';

    if (createTopicListStatus !== 'idle') {
      statusValue = createTopicListStatus;
      error = createTopicListError;
      succeeded = 'Topic successfully created';
    }

    switch (statusValue) {
      case 'loading':
        header = 'Loading...';
        statusValue = 'loading';
        break;
      case 'succeeded':
        header = succeeded;
        statusValue = 'succeeded';
        dispatch(fetchForum({ pageNumber: paginationOptions.page }));
        break;
      case 'failed':
        header = error || 'Something went wrong';
        statusValue = 'failed';
        break;
      default:
        break;
    }

    if (statusValue) {
      setModalConfig({
        show: statusValue !== 'idle',
        header,
        status: statusValue,
      });
    }
  }, [createTopicListStatus, createTopicListError]);

  usePage({ initPage: initForumPage });

  useEffect(() => {
    return () => {
      dispatch(clearForumState());
    };
  }, []);

  return (
    <div className={`${styles['game-forum']} ${styles['fade-in']}`}>
      <ErrorNotification>
        <Navigation title={HEADERS.forum} to={ROUTES.main()} />
        {isAuthorized && (
          <Button
            className={styles['game-forum__button']}
            type="button"
            onClick={() => setIsOpen(prev => !prev)}>
            <img src={add} alt="telegram logo" className={styles['game-forum__buttonIcon']} />
            Add topic
          </Button>
        )}
        <TopicList topicList={topicList} />
        <Pagination options={paginationOptions} onChange={handleChangePage} />
        <Popup open={isOpen} withOverlay onClose={() => setIsOpen(false)}>
          {isOpen && (
            <FormComponent
              fields={createNewTopicFields}
              onSubmit={onSubmit}
              initialValues={createNewTopicFieldsInitialValues}
              submitButtonText="Create topic"
            />
          )}
        </Popup>
        <UniversalModal
          show={modalConfig.show}
          title={modalConfig.header}
          status={modalConfig.status}
          zIndex={2000}
          onHide={handleCloseModal}
        />
      </ErrorNotification>
    </div>
  );
};

export const initForumPage = ({ dispatch, state }: PageInitArgs) => {
  const queue: Array<Promise<unknown>> = [
    dispatch(getTheme({ userId: 123 })),
    dispatch(fetchForum({})),
  ];
  if (!selectTopicList(state)) {
    queue.push(dispatch(fetchForum({})));
  }
  return Promise.all(queue);
};
