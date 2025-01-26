import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Button } from 'react-bootstrap';
import {
  FormComponent,
  UniversalModal,
  IModalConfig,
  ErrorNotification,
  TModalStatus,
} from '@/components';

import { TypeDispatch } from '@/redux/store';
import { registrationRequest } from '@/redux/requests';
import { clearRegistrationState, IRegistrationFormSubmit } from '@/redux/slices';
import { selectRegistrationStatus, selectRegistrationError } from '@/redux/selectors';

import {
  registrationPageFields,
  registrationPageFieldsInitialValues,
} from './RegistrationPageData';
import { ROUTES } from '@/constants/routes';
import { HEADERS } from '@/constants/headers';
import { initPage } from '@/routes';

import { usePage } from '@/services/hooks';

import styles from './Registration.module.scss';

export const Registration = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch<TypeDispatch>();

  const [modalConfig, setModalConfig] = useState<IModalConfig>({
    show: false,
    header: '',
    status: undefined,
  });

  const registrationStatus = useSelector(selectRegistrationStatus);
  const registrationError = useSelector(selectRegistrationError);

  const onSubmit = (data: IRegistrationFormSubmit & { password_repeat: string }) => {
    dispatch(registrationRequest(data));
  };

  const handleCloseModal = () => {
    const status = modalConfig.status;
    dispatch(clearRegistrationState());
    setModalConfig({ show: false, header: '', status: undefined });
    if (status === 'succeeded') {
      navigate(ROUTES.main());
    }
  };

  useEffect(() => {
    let header = '';
    let statusValue: TModalStatus = 'idle';
    let error: typeof registrationError = '';
    let succeeded = '';

    if (registrationStatus !== 'idle') {
      statusValue = registrationStatus;
      error = registrationError;
      succeeded = 'User successfully registered';
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
  }, [registrationStatus, registrationError]);

  usePage({ initPage });

  return (
    <div className={styles['registration-page']}>
      <div className={styles['form-container']}>
        <ErrorNotification>
          <h1>{HEADERS.registration}</h1>
          <FormComponent
            fields={registrationPageFields}
            onSubmit={onSubmit}
            initialValues={registrationPageFieldsInitialValues}
            submitButtonText="Sign up"
          />
          <Button
            className={styles['back-button']}
            type="button"
            variant="primary"
            onClick={() => navigate(-1)}>
            Back
          </Button>
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
