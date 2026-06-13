import { cn } from '../../lib/utils';

/**
 * Text status tag badge tag.
 * 
 * @param {object} props - Component properties
 * @param {string} props.className - Custom styles
 */
export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white',
        className
      )}
      {...props}
    />
  );
}
