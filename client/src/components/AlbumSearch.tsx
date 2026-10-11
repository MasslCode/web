import { Input } from "@/components/ui/input";

interface AlbumSearchProps {
  query: string;
  onSearch: (query: string) => void;
}

export default function AlbumSearch({ query, onSearch }: AlbumSearchProps) {
  return (
    <Input
      placeholder="Search albums..."
      aria-label="Search your album collection"
      className="h-11"
      value={query}
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
