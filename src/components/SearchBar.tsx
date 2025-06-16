import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Search..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="w-full mb-4 relative group">
      <div className={`relative w-full transition-all duration-300 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-md transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`relative flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl transition-all duration-300 ${isFocused ? 'shadow-lg shadow-emerald-500/10 border-emerald-500/50' : 'hover:border-emerald-500/30'}`}>
          <FiSearch className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-emerald-500' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
          />
          {searchQuery && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 