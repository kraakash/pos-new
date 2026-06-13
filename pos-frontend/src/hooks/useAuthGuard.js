import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to guard interactive components and routes requiring user login.
 * If the user is unauthenticated (guest), calls redirect actions.
 * 
 * @returns {object} - Guard methods: isGuest, requireAuth, and guard action wrapper
 */
export function useAuthGuard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  /**
   * Action guard that validates user login before executing a callback.
   * If the user is not authenticated, redirects them to the auth screen.
   * 
   * @param {function} action - The callback function to execute if authorized
   * @param {object} opts - Optional parameter holding login prompt details
   * @returns {boolean} - True if authenticated and action was executed
   */
  const requireAuth = useCallback(
    (action, opts) => {
      if (user) {
        if (typeof action === 'function') return action();
        return true;
      }
      alert(opts?.message || 'Please log in to continue.');
      navigate('/auth');
      return false;
    },
    [user, navigate]
  );

  /**
   * High-order function wrapper to guard event handlers.
   * 
   * @param {function} fn - The event handler function
   * @param {object} opts - Optional login prompt message options
   * @returns {function} - Guarded function wrapping the parameter fn
   */
  const guard = useCallback(
    (fn, opts) =>
      (...args) => {
        if (!user) {
          alert(opts?.message || 'Please log in to continue.');
          navigate('/auth');
          return undefined;
        }
        return fn(...args);
      },
    [user, navigate]
  );

  return { isGuest: !user, requireAuth, guard };
}
