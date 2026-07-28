"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Command, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";

function createDebounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
  resetTrigger?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search", 
  onSearch,
  className,
  resetTrigger = 0,
}) => {
  const [query, setQuery] = useState(""); 
  const [lastNonEmptyQuery, setLastNonEmptyQuery] = useState("");

  useEffect(() => {
    if (resetTrigger > 0) {
      setQuery("");
      setLastNonEmptyQuery("");
      onSearch?.("");
    }
  }, [resetTrigger]);

  const debouncedSearch = useMemo(() => createDebounce((value: string) => {
    const normalizedValue = value.trim();
    if (normalizedValue || lastNonEmptyQuery) {
      onSearch?.(normalizedValue);
    }
    if (normalizedValue) {
      setLastNonEmptyQuery(normalizedValue);
    } else {
      setLastNonEmptyQuery("");
    }
  }, 400), [onSearch, lastNonEmptyQuery]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <Command className={cn(`border border-neutral-300 rounded-lg h-[34px] w-[220px]`, className)}>
        <CommandInput
          className="text-[13px] text-header-secondary placeholder:text-input-placeholder placeholder:italic"
          placeholder={placeholder}
          value={query}
          onValueChange={handleQueryChange}
        />
        <CommandList hidden>
          <CommandEmpty></CommandEmpty>
        </CommandList>
      </Command>
    </div>
  );
};

export default SearchBar;
