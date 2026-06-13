/**
 * Sanitizes and encodes the username or full name of a user to construct an URL-safe handle.
 * 
 * @param {object} user - The user object containing username or fullName
 * @returns {string} - URL-safe candidate identifier handle
 */
export function userHandle(user) {
  const raw = user?.username || user?.fullName || 'student';
  const handle = String(raw).trim().replace(/^@/, '') || 'student';
  return encodeURIComponent(handle);
}

/**
 * Builds the URL path to the candidate's personal dashboard page.
 * 
 * @param {object} user - The user object
 * @returns {string} - Absolute path string (e.g. /@username)
 */
export function dashboardPath(user) {
  return `/${userHandle(user)}`;
}

/**
 * Builds the URL path to the candidate's public profile page.
 * 
 * @param {object} user - The user object
 * @returns {string} - Absolute path string (e.g. /profile/@username)
 */
export function profilePath(user) {
  return `/profile/${userHandle(user)}`;
}
