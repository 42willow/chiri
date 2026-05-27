import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

export type LucideProps = RefAttributes<SVGSVGElement> &
  Partial<SVGProps<SVGSVGElement>> & {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  };

export type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;
