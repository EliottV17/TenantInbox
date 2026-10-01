"use client";

import { Button } from "@/components/ui/button";
import {
  ALL_FILTER_VALUE,
  CATEGORY_FILTER_PARAM,
  URGENCY_FILTER_PARAM,
} from "@/lib/inbox-filters";
import { CATEGORY_OPTIONS, URGENCY_OPTIONS } from "@/lib/constants";
import type { Category, Urgency } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  category?: Category;
  urgency?: Urgency;
  onChange: (key: typeof CATEGORY_FILTER_PARAM | typeof URGENCY_FILTER_PARAM, value: string) => void;
  onClear: () => void;
}

export function FilterBar({ category, urgency, onChange, onClear }: FilterBarProps) {
  return (
    <section aria-label="Message filters" className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="category-filter" className="text-sm font-medium">Category</label>
          <Select items={[{ value: ALL_FILTER_VALUE, label: "All categories" }, ...CATEGORY_OPTIONS]} value={category ?? ALL_FILTER_VALUE} onValueChange={(value) => {
            if (value !== null) onChange(CATEGORY_FILTER_PARAM, value);
          }}>
            <SelectTrigger id="category-filter" aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>All categories</SelectItem>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label htmlFor="urgency-filter" className="text-sm font-medium">Urgency</label>
          <Select items={[{ value: ALL_FILTER_VALUE, label: "All urgencies" }, ...URGENCY_OPTIONS]} value={urgency ?? ALL_FILTER_VALUE} onValueChange={(value) => {
            if (value !== null) onChange(URGENCY_FILTER_PARAM, value);
          }}>
            <SelectTrigger id="urgency-filter" aria-label="Urgency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>All urgencies</SelectItem>
              {URGENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
          disabled={category === undefined && urgency === undefined}
        >
          Clear filters
        </Button>
      </div>
      {category !== undefined && (
        <p className="text-xs text-muted-foreground">
          Uncategorized new or failed messages are not included when filtering by category.
        </p>
      )}
    </section>
  );
}
