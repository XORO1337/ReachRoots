import { shouldUseHashRouting } from '../config/api';

const normalizePath = (path: string): string => {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
};

const buildHashPath = (path: string): string => {
  const normalized = normalizePath(path);
  return shouldUseHashRouting() ? `#${normalized}` : normalized;
};

export const buildAppUrl = (path: string): string => {
  const clientPath = buildHashPath(path);
  if (typeof window === 'undefined') {
    return clientPath;
  }

  const base = window.location.origin.replace(/\/$/, '');
  if (clientPath.startsWith('#')) {
    return `${base}/${clientPath}`;
  }
  return `${base}${clientPath}`;
};

export const redirectToAppRoute = (path: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  const target = buildAppUrl(path);
  window.location.href = target;
};
