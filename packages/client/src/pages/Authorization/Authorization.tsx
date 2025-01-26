import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from 'react-bootstrap';
import {
  FormComponent,
  UniversalModal,
  IModalConfig,
  ErrorNotification,
  TModalStatus,
} from '@/components';
import OAuthButton from '@/components/OAuthButton/OAuthButton';

import { TypeDispatch } from '@/redux/store/store';

import { authorizationRequest, getUserInfoRequest } from '@/redux/requests';
import { clearAuthorizationState, IAuthorizationFormSubmit } from '@/redux/slices';
import { selectAuthorizationError, selectAuthorizationStatus } from '@/redux/selectors';

import {
  authorizationPageFields,
  authorizationPageFieldsInitialValues,
} from './AuthorizationPageData';
import { ROUTES } from '@/constants/routes';
import { HEADERS } from '@/constants/headers';
import { initPage } from '@/routes';

import { setCustomCookieWithMaxAge } from '@/services/cookiesHandler';
import { usePage } from '@/services/hooks';

import styles from './Authorization.module.scss';

export const Authorization = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<TypeDispatch>();

  const [modalConfig, setModalConfig] = useState<IModalConfig>({
    show: false,
    header: '',
    status: undefined,
  });

  const authorizationStatus = useSelector(selectAuthorizationStatus);
  const authorizationError = useSelector(selectAuthorizationError);

  const onSubmit = (data: IAuthorizationFormSubmit) => {
    dispatch(authorizationRequest(data));
  };

  const handleCloseModal = () => {
    const status = modalConfig.status;
    dispatch(clearAuthorizationState());
    setModalConfig({ show: false, header: '', status: undefined });
    if (status === 'succeeded') {
      navigate(ROUTES.main());
    }
  };

  const handleCreateOAuthReques = (code: string) => {
    const request = {
      code: JSON.parse(code)['code'],
      redirect_uri: `${window.location.origin}${ROUTES.oAuthTokenPage()}`,
    };
    onSubmit(request);
  };

  const handleOAuthError = (errorMessage: string) => {
    dispatch(clearAuthorizationState());
    setModalConfig({ show: true, header: errorMessage, status: 'failed' });
  };

  useEffect(() => {
    let header = '';
    let statusValue: TModalStatus = 'idle';
    let error: typeof authorizationError = '';
    let succeeded = '';

    if (authorizationStatus !== 'idle') {
      statusValue = authorizationStatus;
      error = authorizationError;
      succeeded = 'Authorization successful';
    }

    switch (statusValue) {
      case 'loading':
        header = 'Loading...';
        statusValue = 'loading';
        break;
      case 'succeeded':
        header = succeeded;
        statusValue = 'succeeded';
        dispatch(getUserInfoRequest());
        setCustomCookieWithMaxAge('auth', true, 2678400);
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
  }, [authorizationStatus, authorizationError]);

  useEffect(() => {
    return () => {
      handleCloseModal();
    };
  }, []);

  usePage({ initPage });

  return (
    <div className={styles['authorization-page']}>
      <div className={styles['form-container']}>
        <ErrorNotification>
          <h1>{HEADERS.authorization}</h1>
          <FormComponent
            fields={authorizationPageFields}
            onSubmit={onSubmit}
            initialValues={authorizationPageFieldsInitialValues}
            submitButtonText="Sign in"
          />
          <Button
            className={styles['register-button']}
            type="button"
            variant="primary"
            onClick={() => navigate('/registration')}>
            Create account
          </Button>
          <OAuthButton onSuccess={handleCreateOAuthReques} onError={handleOAuthError} />
        </ErrorNotification>
        <UniversalModal
          show={modalConfig.show}
          title={modalConfig.header}
          status={modalConfig.status}
          zIndex={2000}
          onHide={handleCloseModal}
        />
      </div>
    </div>
  );
};
