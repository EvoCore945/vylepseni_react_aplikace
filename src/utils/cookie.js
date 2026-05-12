// CookieComponent.jsx
// Jednoduchý helper na cookies – použitelný v Reactu i mimo něj

export const setCookie = (name, value, days = 1) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

export const getCookie = (name) => {
  const match = document.cookie.match(
    new RegExp(`(?:^| )${name}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};
