type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

/**
 * Tiny `clsx`-style classname combiner: accepts strings, falsy values,
 * nested arrays and conditional objects.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const add = (value: ClassValue) => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
    } else if (Array.isArray(value)) {
      value.forEach(add);
    } else {
      for (const key of Object.keys(value)) {
        if (value[key]) classes.push(key);
      }
    }
  };

  inputs.forEach(add);
  return classes.join(' ');
}
