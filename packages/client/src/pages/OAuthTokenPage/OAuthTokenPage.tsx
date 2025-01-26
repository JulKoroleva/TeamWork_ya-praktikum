import { useEffect } from 'react';
import { IYaSendSuggestToken } from './OAuthTokenPage.interface';
import { ROUTES } from '@/constants/routes';
import { initPage } from '@/routes';
import { usePage } from '@/services/hooks';

declare global {
  interface Window {
    YaSendSuggestToken: IYaSendSuggestToken;
  }
}

const sdkSuggestScriptForOAuthPageUrl =
  'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js';

function loadScript() {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${sdkSuggestScriptForOAuthPageUrl}"]`)) {
      resolve('OAuth script for OAuth page already loaded');
      return;
    }

    const script = document.createElement('script');
    script.src = sdkSuggestScriptForOAuthPageUrl;
    script.onload = () => resolve('Script loaded');
    script.onerror = error => reject(error);

    document.body.appendChild(script);
  });
}

// Пустая страница, необходима для реализации YaOAuth, она появляется на долю секунд в процессе редиректов
export function OAuthTokenPage() {
  usePage({ initPage });
  useEffect(() => {
    function sendToken() {
      window.YaSendSuggestToken(`${window.location.origin}${ROUTES.authorization()}`, {
        flag: true,
      });
    }

    loadScript()
      .then(() => sendToken())
      .catch(error => {
        throw new Error(error);
      });
  }, []);

  return <></>;
}
