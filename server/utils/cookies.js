const isProd = () => process.env.NODE_ENV === 'production';

export const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: isProd() ? 'none' : 'lax',
  path: '/',
  maxAge: maxAgeMs,
});

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';
export const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
};

export const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, { ...cookieOptions(0), maxAge: 0 });
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(0), maxAge: 0 });
};
