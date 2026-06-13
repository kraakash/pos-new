import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Notice banner indicating standard features or stubs.
 * 
 * @param {object} props - Component properties
 * @param {string} props.feature - Name of the feature described
 * @param {string} props.className - Custom styles
 */
export function AiUnavailableBanner({ feature, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-indigo-300/10 bg-[#303143] p-4 text-xs font-semibold leading-relaxed text-[#c7d2fe]',
        className
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-200">
        <Sparkles size={16} />
      </span>
      <div>
        <p className="font-bold text-white">{feature} runs locally</p>
        <p className="mt-0.5 text-slate-400">Our offline simulator logic handles your evaluations instantly without requiring external keys.</p>
      </div>
    </div>
  );
}
