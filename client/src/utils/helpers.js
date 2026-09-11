export const BD_CITIES = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Comilla'];

export const fileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const clean = String(path).replace(/\\/g, '/');
  return clean.startsWith('/') ? clean : `/${clean}`;
};

export const apiErrorMessage = (err, fallback = 'Something went wrong') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || fallback;
};

export const displayName = (person) => {
  if (!person) return 'Member';
  const full = [person.firstName, person.lastName].filter(Boolean).join(' ');
  return person.businessName || person.name || full || person.username || 'Member';
};

export const initialsOf = (personOrName) => {
  if (!personOrName) return '?';
  const name = typeof personOrName === 'string' ? personOrName : displayName(personOrName);
  return name.charAt(0).toUpperCase() || '?';
};
