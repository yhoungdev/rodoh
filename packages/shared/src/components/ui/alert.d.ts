import * as React from "react";
import { type VariantProps } from "class-variance-authority";
declare const alertVariants: any;
declare function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>): React.JSX.Element;
declare function AlertTitle({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element;
declare function AlertDescription({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element;
export { Alert, AlertTitle, AlertDescription };
//# sourceMappingURL=alert.d.ts.map