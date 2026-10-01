"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/filter-bar";
import { MessageList } from "@/components/message-list";
import {
  CATEGORY_FILTER_PARAM,
  URGENCY_FILTER_PARAM,
  clearInboxFilters,
  parseInboxFilters,
  updateInboxFilter,
} from "@/lib/inbox-filters";

export function InboxContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filters = parseInboxFilters(new URLSearchParams(searchParams.toString()));

  function navigate(params: URLSearchParams) {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <FilterBar
        {...filters}
        onChange={(key: typeof CATEGORY_FILTER_PARAM | typeof URGENCY_FILTER_PARAM, value) => {
          navigate(updateInboxFilter(new URLSearchParams(searchParams.toString()), key, value));
        }}
        onClear={() => navigate(clearInboxFilters(new URLSearchParams(searchParams.toString())))}
      />
      <MessageList category={filters.category} urgency={filters.urgency} />
    </>
  );
}
