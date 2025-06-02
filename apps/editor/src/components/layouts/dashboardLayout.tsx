import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  title?: string;
  pageTitle?: string;
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

export function DashboardLayout({
  pageTitle,
  children,
  navItems = [
    { icon: <>🎨</>, label: "Backgrounds", onClick: () => {} },
    { icon: <>✨</>, label: "Effects", onClick: () => {} },
    { icon: <>🔍</>, label: "Zoom", onClick: () => {} },
    { icon: <>✂️</>, label: "Trim / Cut", onClick: () => {} },
    { icon: <>🔊</>, label: "Audio", onClick: () => {} },
  ],
  title = "🪙",
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B0B14] text-white">
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-[#1C1C28] bg-[#12121A] transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-[240px]",
        )}
      >
        <div className="p-6 flex justify-between items-center">
          <img
            src="/logo/16.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {!isCollapsed ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <Navigation navItems={navItems} isCollapsed={isCollapsed} />
        </ScrollArea>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed left-4 top-4 z-40 text-white hover:bg-[#1C1C28]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className=" border-r-0 bg-[#12121A] p-0">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <Navigation navItems={navItems} isCollapsed={false} />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-y-auto bg-[#1d1e22]  lg:w-[calc(100vw-240px)]">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-[calc(100%-240px)] mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
