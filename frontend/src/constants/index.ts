// constants/index.ts
// 애플리케이션의 모든 상수를 내보내는 중앙 파일

export * from './routes';
export * from './theme';

// API 엔드포인트
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: '/users/reset-password',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/password',
  },
  POSTS: {
    GET_ALL: '/posts',
    GET_MY_POSTS: '/posts/me',
    CREATE: '/posts',
    DETAIL: (id: string) => `/posts/${id}`,
    COMMENTS: (id: string) => `/posts/${id}/comments`,
    LIKE: (id: string) => `/posts/${id}/like`,
  },
  MY_DAY: {
    POSTS: '/my-day/posts',
    MY_POSTS: '/my-day/posts/me',
    CREATE: '/my-day/posts',
    DETAIL: (id: string) => `/my-day/${id}`,
    COMMENTS: (id: string) => `/my-day/${id}/comments`,
    LIKE: (id: string) => `/my-day/${id}/like`,
  },
  SOMEONE_DAY: {
    POSTS: '/someone-day',
    POPULAR: '/someone-day/popular',
    DETAIL: (id: string) => `/someone-day/${id}`,
    ENCOURAGE: (id: string) => `/someone-day/${id}/encourage`,
    REPORT: (id: string) => `/someone-day/${id}/report`,
  },
  EMOTIONS: {
    ALL: '/emotions',
    DAILY_CHECK: '/emotions/daily-check',
    STATS: '/emotions/stats',
    TRENDS: '/emotions/trends',
    CREATE: '/emotions',
  },
  CHALLENGES: {
    ALL: '/challenges',
    CREATE: '/challenges',
    DETAIL: (id: string) => `/challenges/${id}`,
    PARTICIPATE: (id: string) => `/challenges/${id}/participate`,
    LEAVE: (id: string) => `/challenges/${id}/participate`, // DELETE 메서드로 사용
    PROGRESS: (id: string) => `/challenges/${id}/progress`,
  },
  COMFORT_WALL: {
    POSTS: '/comfort-wall',
    BEST: '/comfort-wall/best',
    MESSAGE: (id: string) => `/comfort-wall/${id}/message`,
  },
  NOTIFICATIONS: {
    ALL: '/notifications',
    READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
  TAGS: {
    ALL: '/tags',
    POPULAR: '/tags/popular',
    SEARCH: '/tags/search',
  },
  STATS: {
    USER: '/stats',
    TRENDS: '/stats/trends',
    WEEKLY: '/stats/weekly',
    MONTHLY: '/stats/monthly',
  },
};

// 애플리케이션 일반 상수
export const APP_CONSTANTS = {
  APP_NAME: 'IExist',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    AUTH_TOKEN: '@IExist:authToken',
    USER: '@IExist:user',
    THEME: '@IExist:theme',
  },
  DEFAULT_PAGE_SIZE: 10,
  MAX_CONTENT_LENGTH: {
    POST: 1000,
    COMMENT: 300,
    MY_DAY_POST: 1000,
    SOMEONE_DAY_POST: 2000,
    CHALLENGE_TITLE: 100,
    CHALLENGE_DESCRIPTION: 500,
    EMOTION_NOTE: 200,
  },
  TIMEOUTS: {
    API_REQUEST: 30000, // 30초
    TOAST_DURATION: 3000, // 3초
  }
};