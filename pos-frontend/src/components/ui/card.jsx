import { cn } from '../../lib/utils';

/**
 * Custom Card panel with structured borders and styling.
 * 
 * @param {object} props - Component properties
 * @param {string} props.className - Custom styles
 */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/8 bg-[#303143] p-5 shadow-[0_18px_38px_rgba(0,0,0,0.2)]',
        className
      )}
      {...props}
    />
  );
}
