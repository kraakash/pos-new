import { cn } from '../../lib/utils';

/**
 * Centered illustration component when data results are empty.
 * 
 * @param {object} props - Component properties
 * @param {React.ElementType} props.icon - Lucide icon class
 * @param {string} props.title - Main headline
 * @param {string} props.message - Descriptive text
 * @param {React.ReactNode} props.action - Optional call to action button
 */
export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#242536] rounded-2xl border border-white/8">
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-indigo-500/10 text-indigo-300">
          <Icon size={22} />
        </span>
      )}
      <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500 max-w-[280px]">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
