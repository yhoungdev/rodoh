import { cn } from "@/lib/utils.ts";
export interface NavItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: string;
}

const NavButton = ({
  item,
  isCollapsed,
}: {
  item: NavItem;
  isCollapsed: boolean;
}) => (
  <button
    onClick={item.onClick}
    className={cn(
      "flex items-center cursor-pointer w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-gray-400 hover:bg-[#1C1C28] hover:text-white",
    )}
  >
    <span className="flex-shrink-0 text-2xl">{item.icon}</span>
    <span
      className={cn("transition-opacity", isCollapsed && "opacity-0 hidden")}
    >
      {item.label}
    </span>
    {item.badge && (
      <span className="ml-auto rounded-full bg-[#1C1C28] px-2 py-0.5 text-xs">
        {item.badge}
      </span>
    )}
  </button>
);

const Navigation = ({
  navItems,
  isCollapsed,
}: {
  navItems: NavItem[];
  isCollapsed: boolean;
}) => (
  <nav className="flex flex-col space-y-1 px-3 py-2">
    {navItems.map((item) => (
      <NavButton key={item.label} item={item} isCollapsed={isCollapsed} />
    ))}
  </nav>
);

export { NavButton, Navigation };
