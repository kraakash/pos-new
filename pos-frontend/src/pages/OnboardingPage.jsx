import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { hasCompletedOnboarding } from '../lib/onboarding';
import { dashboardPath } from '../lib/routes';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

// Base API URL for endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

/**
 * OnboardingPage Page Component
 * Renders a step-by-step form profile wizard for newly registered candidates.
 * Collects college branch, year, skill level, target companies, and placement goal,
 * then updates candidate stats in the user store.
 */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState('Computer Science');
  const [year, setYear] = useState('3');
  const [skillLevel, setSkillLevel] = useState('INTERMEDIATE');
  const [targetCompanies, setTargetCompanies] = useState('Google, Microsoft, Amazon');
  const [placementGoal, setPlacementGoal] = useState('Software Engineer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if user already completed onboarding
  useEffect(() => {
    if (hasCompletedOnboarding(user)) {
      navigate(dashboardPath(user), { replace: true });
    }
  }, [navigate, user]);

  /**
   * Submits student profile fields, stubs roadmap initialization,
   * retrieves updated user details, and redirects.
   * 
   * @param {React.FormEvent} event - Submit event
   */
  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 1. Submit profile onboarding parameters
      const onboardingResponse = await fetch(`${API_BASE_URL}/users/onboarding`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          branch,
          year: parseInt(year, 10),
          skillLevel,
          targetCompanies: targetCompanies.split(',').map((v) => v.trim()).filter(Boolean),
          placementGoal
        })
      });

      if (!onboardingResponse.ok) {
        const errData = await onboardingResponse.json();
        throw new Error(errData.message || 'Onboarding submission failed.');
      }

      // 2. Trigger active roadmap generation
      await fetch(`${API_BASE_URL}/users/roadmap/generate`, {
        method: 'POST',
        headers
      });

      // 3. Fetch refreshed profile details
      const meResponse = await fetch(`${API_BASE_URL}/users/me`, {
        headers
      });

      if (!meResponse.ok) {
        throw new Error('Failed to retrieve updated profile information.');
      }

      const refreshedUser = await meResponse.json();
      
      // Update global user store
      setUser(refreshedUser);

      // Navigate to personal dashboard
      navigate(dashboardPath(refreshedUser));
    } catch (e) {
      setError(e.message || 'Something went wrong during onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#585967] p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl rounded-[28px] bg-[#242436] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <Card className="border-0 bg-[#252638]">
          <h2 className="text-xl font-bold text-white">Student Onboarding</h2>
          <p className="mt-1 text-sm text-slate-500 font-semibold">Step {step} of 2</p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch/Major</label>
                  <Input
                    placeholder="e.g. Computer Science"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Year</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="e.g. 3"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Self-Assessed Skill Level</label>
                  <select
                    className="w-full h-12 rounded-2xl border border-white/10 bg-[#2c3040] px-4 text-sm font-semibold text-white outline-none transition focus:border-indigo-300/40 focus:ring-4 focus:ring-indigo-400/10"
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                  >
                    <option value="BEGINNER">Beginner (New to DSA / coding)</option>
                    <option value="INTERMEDIATE">Intermediate (Familiar with core concepts)</option>
                    <option value="ADVANCED">Advanced (Confident solving medium/hard problems)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!branch.trim() || !year}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Companies</label>
                  <Input
                    placeholder="e.g. Google, Microsoft, Amazon"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-slate-500 font-semibold">Separate multiple companies with commas.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Goal</label>
                  <Input
                    placeholder="e.g. Software Engineer"
                    value={placementGoal}
                    onChange={(e) => setPlacementGoal(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-rose-400/10 p-3 text-sm font-semibold text-rose-200">
                    {error}
                  </p>
                )}

                <div className="pt-2 flex justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !targetCompanies.trim() || !placementGoal.trim()}
                  >
                    {submitting ? 'Completing Setup...' : 'Complete Onboarding'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
