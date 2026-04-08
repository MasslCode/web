import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface AlbumSearchProps {
  onSearch: (query: string) => void;
}

export default function AlbumSearch({ onSearch }: AlbumSearchProps) {
  const [query, setQuery] = useState('');
  const hasQueried = useRef(false);

  useEffect(() => {
    if (!query && !hasQueried.current) return;
    hasQueried.current = true;
    const timer = setTimeout(() => {
      onSearch(query.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <Input
      placeholder="Search albums..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
