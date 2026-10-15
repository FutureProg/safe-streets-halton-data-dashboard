"use client";

import type { ReactNode } from "react";
import { cn } from "cn";
import {
  DateInput,
  DatePicker as DatePickerPrimitive,
  DateSegment,
  Dialog,
  Group,
  type DatePickerProps,
  type DateValue,
} from "react-aria-components";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover } from "@/components/ui/popover";

function DatePicker<T extends DateValue>({
  label,
  className,
  ...props
}: Omit<DatePickerProps<T>, "className" | "children"> & {
  label: ReactNode;
  className?: string;
}) {
  return (
    <DatePickerPrimitive
      data-slot="date-picker"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    >
      <Label>{label}</Label>
      <Group className="border-input bg-input/20 focus-within:border-ring focus-within:ring-ring/30 data-invalid:border-destructive dark:bg-input/30 flex h-7 w-full items-center rounded-md border pl-2 transition-colors focus-within:ring-2">
        <DateInput className="flex flex-1 items-center text-xs/relaxed">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="data-focused:bg-accent data-focused:text-accent-foreground data-placeholder:text-muted-foreground rounded-sm px-0.5 tabular-nums outline-none"
            />
          )}
        </DateInput>
        <Button variant="ghost" size="icon-xs" className="mr-0.5">
          <CalendarIcon />
        </Button>
      </Group>
      <Popover className="w-auto p-0">
        <Dialog>
          <Calendar />
        </Dialog>
      </Popover>
    </DatePickerPrimitive>
  );
}

export { DatePicker };
