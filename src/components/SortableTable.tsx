import { useEffect, useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export interface Validator {
  id: number;
  validator_name: string;
  commission: number;
}

interface SortableTableProps {
  activeData: Validator[];
  inactiveData: Validator[];
  searchQuery?: string;
}

const columns: { label: string; key: keyof Validator }[] = [
  { label: "Validator Name", key: "validator_name" },
];

const SortableTable: React.FC<SortableTableProps> = ({ 
  activeData, 
  inactiveData,
  searchQuery = "" 
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Validator;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const itemsPerPage = 1000;

  // Filter data based on search query and active/inactive filter
  const filteredData = useMemo(() => {
    const data = filter === "active" ? activeData : inactiveData;
    
    if (!searchQuery) return data;
    
    return data.filter(validator => 
      validator.validator_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeData, inactiveData, filter, searchQuery]);

  // Sort the filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const { key, direction } = sortConfig;
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";

      return direction === "asc"
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  }, [filteredData, sortConfig]);

  // Paginate the sorted data
  const pageData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: keyof Validator) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  return (
    <div className="w-full">
      {/* Toggle for Active/Inactive */}
      <div className="mb-4 flex space-x-4">
        <button
          className={`rounded-md px-4 py-2 text-sm ${
            filter === "active" ? "bg-emerald-300" : "bg-gray-200"
          }`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm ${
            filter === "inactive" ? "bg-emerald-300" : "bg-gray-200"
          }`}
          onClick={() => setFilter("inactive")}
        >
          Inactive
        </button>
      </div>

      {/* Search Info */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredData.length} validators matching "{searchQuery}"
        </div>
      )}

      <table className="w-full rounded-lg border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            {columns.map(({ label, key }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="cursor-pointer p-3 text-left"
              >
                {label}
                {sortConfig?.key === key &&
                  (sortConfig.direction === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.length > 0 ? (
            pageData.map((row, index) => (
              <tr key={index} className="border-t text-left hover:bg-gray-50">
                <td className="p-3 font-mono text-sm">{row.validator_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                {filteredData.length === 0
                  ? "No validators found"
                  : "No results on this page"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {sortedData.length > itemsPerPage && (
        <div className="ml-auto mr-0 mt-4 flex w-1/6 justify-between text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`rounded border px-4 py-2 ${
              currentPage === 1
                ? "cursor-not-allowed bg-gray-300"
                : "bg-emerald-300 text-black hover:bg-emerald-400"
            }`}
          >
            <FiChevronLeft />
          </button>
          <span className="py-2">
            Page {currentPage} of {Math.ceil(sortedData.length / itemsPerPage)}
          </span>
          <button
            disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`rounded border px-4 py-2 ${
              currentPage === Math.ceil(sortedData.length / itemsPerPage)
                ? "cursor-not-allowed bg-gray-300"
                : "bg-emerald-300 text-black hover:bg-emerald-400"
            }`}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default SortableTable;
