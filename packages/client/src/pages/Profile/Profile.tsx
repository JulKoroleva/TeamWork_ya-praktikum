import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Button } from 'react-bootstrap';
import {
  FormComponent,
  ErrorNotification,
  Loader,
  UniversalModal,
  IModalConfig,
  TModalStatus,
} from '@/components';

import {
  profileRequests,
  passwordRequests,
  avatarRequests,
  getUserInfoRequest,
} from '@/redux/requests';
import { clearChangeUserState, IUserInfo, IUserPassword } from '@/redux/slices';
import { selectUser, selectUserError, selectUserStatus } from '@/redux/selectors';

import { settingsFields, changePasswordFields } from './profilePageData';
import { HEADERS } from '@/constants/headers';

import { TypeDispatch } from '@/redux/store';

import { embedTextInImage } from '@/utils/colorFileUtils';
import { createImageFile } from '@/utils/createImageFile';
import { base64ToFile } from '@/utils/base64ToFile';
import { useIsAuthorized, usePage } from '@/services/hooks';
import { getCookie } from '@/services/cookiesHandler';

import { ROUTES } from '@/constants/routes';
import { initPage } from '@/routes';

import styles from './profile.module.scss';

export const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<TypeDispatch>();
  const [isAuthorized, setIsAuthorized] = useIsAuthorized();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const userInfo = useSelector(selectUser);
  const userStatus = useSelector(selectUserStatus);
  const userError = useSelector(selectUserError);

  const [modalConfig, setModalConfig] = useState<IModalConfig>({
    show: false,
    header: '',
    status: undefined,
  });

  const authCookie = getCookie('auth');

  const onSubmit = async (data: IUserInfo | IUserPassword) => {
    if (isChangingPassword) {
      dispatch(
        passwordRequests({
          oldPassword: (data as IUserPassword).oldPassword,
          newPassword: (data as IUserPassword).newPassword,
        }),
      );
    } else {
      const userInfo = data as IUserInfo;

      const isRgbColor = userInfo.avatar?.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

      let avatarUrl = userInfo.avatar;

      if (isRgbColor) {
        try {
          const generatedImage = await createImageFile(100, 100, userInfo.avatar as string);
          const colorFile = await embedTextInImage(generatedImage, userInfo.avatar);
          const response = await dispatch(avatarRequests(colorFile));
          avatarUrl = response.payload as string;
        } catch (error) {
          return;
        }
      } else if (userInfo.avatar.startsWith('data:image/')) {
        try {
          const file = base64ToFile(userInfo.avatar, 'avatar.jpg');
          const response = await dispatch(avatarRequests(file));
          avatarUrl = response.payload as string;
        } catch (error) {
          return;
        }
      }

      const updatedData: IUserInfo = { ...userInfo, avatar: avatarUrl };
      await dispatch(profileRequests(updatedData));
      dispatch(getUserInfoRequest());
    }
  };

  const handleCloseModal = () => {
    setModalConfig({ show: false, header: '', status: undefined });
    dispatch(clearChangeUserState());
    if (isChangingPassword) {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    let header = '';
    let statusValue: TModalStatus = 'idle';
    let error: typeof userError = '';
    let succeeded = '';

    if (userStatus && userStatus !== 'idle') {
      statusValue = userStatus;
      error = userError;
      succeeded = 'Settings successfully chanched';
    }

    switch (statusValue) {
      case 'loading':
        header = 'Loading...';
        statusValue = 'loading';
        break;
      case 'succeeded':
        header = succeeded;
        statusValue = 'succeeded';
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
  }, [userStatus, userError]);

  usePage({ initPage });

  const settings = (
    <>
      <h1>{HEADERS.profile}</h1>
      <FormComponent
        fields={settingsFields}
        onSubmit={onSubmit}
        initialValues={userInfo || undefined}
        submitButtonText="Save"
      />
      <Button
        className={styles['change-password-button']}
        variant="primary"
        onClick={() => setIsChangingPassword(true)}>
        Change password
      </Button>
      <Button
        className={styles['back-button']}
        type="button"
        variant="primary"
        onClick={() => navigate(-1)}>
        Back
      </Button>
    </>
  );

  const changePassword = (
    <>
      <h1>Change password</h1>
      <FormComponent fields={changePasswordFields} onSubmit={onSubmit} submitButtonText="Save" />
      <Button
        className={styles['back-button']}
        type="button"
        variant="primary"
        onClick={() => setIsChangingPassword(false)}>
        Back
      </Button>
    </>
  );

  useEffect(() => {
    setIsAuthorized(!!authCookie);
  }, [authCookie]);

  if (!isAuthorized) {
    navigate(ROUTES.authorization());
    return null;
  }

  return (
    <>
      {!userInfo?.id ? (
        <Loader />
      ) : (
        <div className={styles['profile-page']}>
          <div className={styles['form-container']}>
            <ErrorNotification>{isChangingPassword ? changePassword : settings}</ErrorNotification>
            <UniversalModal
              show={modalConfig.show}
              title={modalConfig.header}
              status={modalConfig.status}
              zIndex={2000}
              onHide={handleCloseModal}
            />
          </div>
        </div>
      )}
    </>
  );
};
