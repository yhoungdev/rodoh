import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
declare const Form: any;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => React.JSX.Element;
declare const useFormField: () => any;
declare function FormItem({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element;
declare function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>): React.JSX.Element;
declare function FormControl({ ...props }: React.ComponentProps<typeof Slot>): React.JSX.Element;
declare function FormDescription({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element;
declare function FormMessage({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element | null;
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, };
//# sourceMappingURL=form.d.ts.map