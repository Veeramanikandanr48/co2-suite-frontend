import React, { useMemo, useState, useEffect } from "react";
import { Command, CommandInput, CommandList, CommandEmpty } from "~/components/ui/command";
import { debounce } from "lodash";
import { cn } from "~/lib/utils";

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
    setQuery("");
    setLastNonEmptyQuery("");
    onSearch?.("");
  }, [resetTrigger, onSearch]);

  const debouncedSearch = useMemo(() => debounce((value: string) => {
    const normalizedValue = value.trim();
    if (normalizedValue || lastNonEmptyQuery) {
      onSearch?.(normalizedValue);
    }
    if (normalizedValue) {
      setLastNonEmptyQuery(normalizedValue);
    } else {
      setLastNonEmptyQuery("");
    }
  }, 500), [onSearch, lastNonEmptyQuery]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <Command className={cn(`border border-neutral-300 rounded-lg h-[30px] w-[200px]`, className)}>
        <CommandInput
          className=" text-[13px] text-header-secondary placeholder:text-input-placeholder placeholder:italic"
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
