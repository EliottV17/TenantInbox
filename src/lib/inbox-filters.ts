import { CATEGORY_OPTIONS, URGENCY_OPTIONS } from "./constants";
import type { Category, Urgency } from "./constants";

export const ALL_FILTER_VALUE = "all";
export const CATEGORY_FILTER_PARAM = "category";
export const URGENCY_FILTER_PARAM = "urgency";

export interface InboxFilters {
  category?: Category;
  urgency?: Urgency;
}

function isCategory(value: string | null): value is Category {
  return value !== null && CATEGORY_OPTIONS.some((option) => option.value === value);
}

function isUrgency(value: string | null): value is Urgency {
  return value !== null && URGENCY_OPTIONS.some((option) => option.value === value);
}

export function parseInboxFilters(params: URLSearchParams): InboxFilters {
  const category = params.get(CATEGORY_FILTER_PARAM);
  const urgency = params.get(URGENCY_FILTER_PARAM);

  return {
    ...(isCategory(category) ? { category } : {}),
    ...(isUrgency(urgency) ? { urgency } : {}),
  };
}

export function updateInboxFilter(
  current: URLSearchParams,
  key: typeof CATEGORY_FILTER_PARAM | typeof URGENCY_FILTER_PARAM,
  value: string,
): URLSearchParams {
  const updated = new URLSearchParams(current);
  const valid = key === CATEGORY_FILTER_PARAM ? isCategory(value) : isUrgency(value);

  if (value === ALL_FILTER_VALUE || !valid) {
    updated.delete(key);
  } else {
    updated.set(key, value);
  }

  return updated;
}

export function clearInboxFilters(current: URLSearchParams): URLSearchParams {
  const updated = new URLSearchParams(current);
  updated.delete(CATEGORY_FILTER_PARAM);
  updated.delete(URGENCY_FILTER_PARAM);
  return updated;
}
