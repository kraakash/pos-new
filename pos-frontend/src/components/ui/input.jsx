import { cn } from '../../lib/utils';

/**
 * Text input element.
 * 
 * @param {object} props - Component properties
 * @param {string} props.className - Custom styles
 */
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-2xl border border-white/10 bg-[#252638] px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/60 focus:ring-4 focus:ring-indigo-400/10',
        className
      )}
      {...props}
    />
  );
}
