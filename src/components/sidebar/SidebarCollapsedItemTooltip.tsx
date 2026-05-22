interface SidebarCollapsedItemTooltipProps {
  name: string;
  type: string;
}

export const SidebarCollapsedItemTooltip = ({ name, type }: SidebarCollapsedItemTooltipProps) => (
  <span className="flex flex-col leading-tight whitespace-nowrap">
    <span>{name}</span>
    <span className="text-[10px] font-normal text-white/65">{type}</span>
  </span>
);
