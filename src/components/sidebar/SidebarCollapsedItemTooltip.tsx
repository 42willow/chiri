interface SidebarCollapsedItemTooltipProps {
  name: string;
  type: string;
}

export const SidebarCollapsedItemTooltip = ({ name, type }: SidebarCollapsedItemTooltipProps) => (
  <span className="flex flex-col whitespace-nowrap leading-tight">
    <span>{name}</span>
    <span className="font-normal text-[10px] text-white/65">{type}</span>
  </span>
);
