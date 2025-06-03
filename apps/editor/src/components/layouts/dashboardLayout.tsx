import { useState } from "react";
import {
  Button,
  ScrollArea,
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui";
import {
  NavItem,
  Navigation,
} from "@/components/layouts/components/nav-item.tsx";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import BackgroundModule from "@/components/modules/background.tsx";
import ExportSettings from "@/components/modules/export-settings.tsx";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems?: NavItemWithComponent[];
  title?: string;
  pageTitle?: string;
}

interface NavItemWithComponent extends NavItem {
  component?: React.ReactNode;
}

export function DashboardLayout({
  children,
  navItems = [
    {
      icon: <>🎨</>,
      label: "Backgrounds",
      component: <BackgroundModule />,
    },
    // {
    //   icon: <>✨</>,
    //   label: "Effects",
    //   component: <div className="p-6">Effects Panel</div>,
    // },
    {
      icon: <>🔍</>,
      label: "Zoom",
      component: <div className="p-6">Zoom Controls</div>,
    },
    // {
    //   icon: <>✂️</>,
    //   label: "Trim / Cut",
    //   component: <div className="p-6">Trim / Cut Tools</div>,
    // },
    {
      icon: <>🔊</>,
      label: "Audio",
      component: <div className="p-6">Audio Settings</div>,
    },
    {
      icon: <> ⚙️ </>,
      label: "Settings",
      component: <ExportSettings />,
    },
  ],
  title = "🪙",
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedComponent, setSelectedComponent] =
    useState<React.ReactNode>(null);

  const handleNavClick = (component: React.ReactNode) => {
    setSelectedComponent(component);
    setOpenSheet(true);
  };

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
          <Navigation
            navItems={navItems.map((item) => ({
              ...item,
              onClick: () => handleNavClick(item.component),
            }))}
            isCollapsed={isCollapsed}
          />
        </ScrollArea>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed left-4 top-4 z-40 text-white hover:bg-[#1C1C28]"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="border-r-0 bg-[#12121A] p-0">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <Navigation
              navItems={navItems.map((item) => ({
                ...item,
                onClick: () => handleNavClick(item.component),
              }))}
              isCollapsed={false}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent
          side="right"
          className="bg-[#12121A] text-white w-full sm:w-[400px]"
        >
          <ScrollArea className="h-full">{selectedComponent}</ScrollArea>
        </SheetContent>
      </Sheet>

      <main
        className={`flex-1 overflow-y-auto bg-[#1d1e22] 
        ${!isCollapsed ? "lg:w-[calc(100vw-240px)]" : "lg:w-[calc(100vw-80px)]"}`}
      >
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
