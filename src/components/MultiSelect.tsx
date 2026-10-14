"use client";

import { ReactNode, useContext, useEffect, useState } from "react";
import { ComboBoxStateContext } from "react-aria-components";
import { XIcon } from "lucide-react";
import type { HTMLInputOption } from "@/app/common";
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface MultiSelectProps {
  label: ReactNode;
  options: HTMLInputOption[];
  value?: string[];
  defaultValues?: string[];
  onChange?: (selectedValues: string[]) => void;
  name?: string;
}

/** Highlights the first match while typing so Enter confirms it. */
function FocusFirstMatch() {
  const state = useContext(ComboBoxStateContext);
  const inputValue = state?.inputValue;
  const collection = state?.collection;
  useEffect(() => {
    if (state && inputValue && collection) {
      state.selectionManager.setFocusedKey(collection.getFirstKey());
    }
  }, [state, inputValue, collection]);
  return null;
}

const MultiSelect = ({
  label,
  options,
  value,
  defaultValues = [],
  onChange,
  name,
}: MultiSelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValues);
  const selected = value ?? internalValue;
  const items = options.map(({ value, label }) => ({ id: value, label }));
  const selectedItems = items.filter(({ id }) => selected.includes(id));
  const availableItems = items.filter(({ id }) => !selected.includes(id));

  const update = (next: string[]) => {
    setInternalValue(next);
    onChange?.(next);
  };

  return (
    <Combobox
      selectionMode="multiple"
      value={selected}
      menuTrigger="focus"
      allowsEmptyCollection
      onChange={(keys) => update(keys.map(String))}
      className="flex w-full flex-col gap-2"
    >
      <FocusFirstMatch />
      <Label>{label}</Label>
      <ComboboxChips>
        {selectedItems.map((item) => (
          <span
            key={item.id}
            data-slot="combobox-chip"
            className="bg-muted-foreground/10 text-foreground flex h-[calc(--spacing(4.75))] w-fit items-center justify-center gap-1 rounded-[calc(var(--radius-sm)-2px)] pl-1.5 text-xs/relaxed font-medium whitespace-nowrap"
          >
            {item.label}
            <Button
              variant="ghost"
              size="icon-xs"
              slot={null}
              aria-label={`Remove ${item.label}`}
              className="opacity-50 hover:opacity-100"
              onPress={() => update(selected.filter((id) => id !== item.id))}
            >
              <XIcon />
            </Button>
          </span>
        ))}
        <ComboboxChipsInput />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList
          renderEmptyState={() => <ComboboxEmpty>No results</ComboboxEmpty>}
        >
          {availableItems.map((item) => (
            <ComboboxItem key={item.id} id={item.id}>
              {item.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
      {name ? (
        <input type="hidden" name={name} value={selected.join(",")} />
      ) : null}
    </Combobox>
  );
};

export default MultiSelect;
