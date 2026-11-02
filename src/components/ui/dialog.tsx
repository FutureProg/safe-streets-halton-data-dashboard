"use client";

import * as React from "react";
import { cn } from "cn";
import {
  Heading,
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
  Dialog as DialogPrimitive,
  type ModalOverlayProps as ModalOverlayPrimitiveProps,
} from "react-aria-components";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** A centred modal dialog; the sibling of `Sheet`, which slides in from an edge. */
function Dialog({
  className,
  children,
  closeLabel = "Close",
  ...props
}: Omit<ModalOverlayPrimitiveProps, "className" | "children"> & {
  className?: string;
  children: React.ReactNode;
  closeLabel?: string;
}) {
  return (
    <ModalOverlayPrimitive
      data-slot="dialog-overlay"
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-150 data-entering:opacity-0 data-exiting:opacity-0"
      {...props}
    >
      <ModalPrimitive
        data-slot="dialog"
        className={cn(
          "flex max-h-[85dvh] w-full max-w-md flex-col rounded-xl bg-popover text-xs/relaxed text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition duration-150 data-entering:scale-95 data-entering:opacity-0 data-exiting:scale-95 data-exiting:opacity-0",
          className,
        )}
      >
        <DialogPrimitive className="flex min-h-0 flex-1 flex-col outline-none">
          {children}
          <Button
            slot="close"
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 right-4"
            aria-label={closeLabel}
          >
            <XIcon />
          </Button>
        </DialogPrimitive>
      </ModalPrimitive>
    </ModalOverlayPrimitive>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 p-6 pr-12", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Heading>, "slot">) {
  return (
    <Heading
      slot="title"
      data-slot="dialog-title"
      className={cn(
        "font-heading text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "slot">) {
  return (
    <div
      data-slot="dialog-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription };
