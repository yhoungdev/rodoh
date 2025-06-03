import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ReactNode } from "react";

type TDirection = "top" | "bottom" | "left" | "right";

interface SheetLayoutProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  children?: ReactNode;
  side?: TDirection;
}

const SheetLayout = ({
  trigger,
  title,
  description,
  children,
  side = "right",
}: SheetLayoutProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        {children}
      </SheetContent>
    </Sheet>
  );
};

export default SheetLayout;
