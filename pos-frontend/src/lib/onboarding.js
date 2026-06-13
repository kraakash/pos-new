/**
 * Checks if a user has completed the initial student onboarding steps.
 * Verification is based on whether they have selected a college branch and target companies.
 * 
 * @param {object} user - The logged-in user details
 * @returns {boolean} - True if onboarding is complete
 */
export function hasCompletedOnboarding(user) {
  const hasValidBranch = Boolean(user?.branch) && user.branch !== 'Unknown';
  const hasTargets = Array.isArray(user?.targetCompanies) && user.targetCompanies.length > 0;
  return hasValidBranch && hasTargets;
}
