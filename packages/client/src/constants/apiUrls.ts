import { SERVER_HOST } from './serverHost';

export const MAIN_URL = 'https://ya-praktikum.tech/api/v2';
export const RESOURCES_URL = `${MAIN_URL}/resources/`;

// REGISTRATION
export const REGISTER_URL = `${MAIN_URL}/auth/signup`;

// AUTHORIZATION
export const LOGIN_URL = `${MAIN_URL}/auth/signin`;
export const LOGOUT_URL = `${MAIN_URL}/auth/logout`;

//USER
export const GET_USER_INFO_URL = `${MAIN_URL}/auth/user`;

//USER SETTINGS
export const PROFILE_URL = `${MAIN_URL}/user/profile`;
export const CHANGE_PASSWORD_URL = `${MAIN_URL}/user/password`;
export const CHANGE_AVATAR_URL = `${MAIN_URL}/user/profile/avatar`;

//LEADERBOARD
export const GET_LEADERBOARD_URL = `${MAIN_URL}/leaderboard`;

//OAUTH
export const GET_SERVICE_ID = `${MAIN_URL}/oauth/yandex/service-id`;
export const OAUTH_SIGN_IN_UP = `${MAIN_URL}/oauth/yandex`;

//FORUM
export const TOPICS_URL = `${SERVER_HOST}/forum`;

//THEME
export const THEME_URL = `${SERVER_HOST}/theme`;
