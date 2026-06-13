import { cn } from '../../lib/utils';

/**
 * Premium custom button element.
 * 
 * @param {object} props - Component properties
 * @param {'primary'|'secondary'|'ghost'} props.variant - Visual style variant
 * @param {string} props.className - Custom styles
 */
export function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary' && 'bg-indigo-500 text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] hover:bg-indigo-400',
        variant === 'secondary' && 'bg-amber-400 text-[#242436] hover:bg-amber-300',
        variant === 'ghost' && 'border border-white/10 bg-[#303143] text-slate-200 hover:bg-[#38394e] hover:text-white',
        className
      )}
      {...props}
    />
  );
}
