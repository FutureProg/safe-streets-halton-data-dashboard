"use client";

import { ReactNode, useState } from "react";
import type { HTMLInputOption } from "@/app/common";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

export interface MultiSelectProps {
  label: ReactNode;
  options: HTMLInputOption[];
  value?: string[];
  defaultValues?: string[];
  onChange?: (selectedValues: string[]) => void;
  name?: string;
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

  return (
    <Combobox
      selectionMode="multiple"
      items={items}
      value={selected}
      menuTrigger="focus"
      allowsEmptyCollection
      onChange={(keys) => {
        const next = keys.map(String);
        setInternalValue(next);
        onChange?.(next);
      }}
      className="flex w-full flex-col gap-2"
    >
      <Label>{label}</Label>
      <ComboboxChips>
        <ComboboxChipList>
          {(item: { id: string; label: string }) => (
            <ComboboxChip id={item.id}>{item.label}</ComboboxChip>
          )}
        </ComboboxChipList>
        <ComboboxChipsInput />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList
          renderEmptyState={() => <ComboboxEmpty>No results</ComboboxEmpty>}
        >
          {(item: { id: string; label: string }) => (
            <ComboboxItem id={item.id}>{item.label}</ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
      {name ? (
        <input type="hidden" name={name} value={selected.join(",")} />
      ) : null}
    </Combobox>
  );
};

export default MultiSelect;
