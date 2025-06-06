import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export interface Validator {
  id: number;
  validator_name: string;
  commission: number;
}

interface SortableTableProps {
  activeData: Validator[];
  inactiveData: Validator[];
}

const columns: { label: string; key: keyof Validator }[] = [
  { label: "Validator Name", key: "validator_name" },
];

const SortableTable: React.FC<SortableTableProps> = ({ activeData, inactiveData }) => {
  const [sortedData, setSortedData] = useState<Validator[]>([]);
  const [pageData, setPageData] = useState<Validator[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Validator;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const itemsPerPage = 1000;

  useEffect(() => {
    const filteredData = filter === "active" ? activeData : inactiveData;

    const sorted = [...filteredData].sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";

      return direction === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
          ? 1
          : -1;
    });

    setSortedData(sorted);
    setCurrentPage(1); // reset page when filter or sort changes
  }, [sortConfig, activeData, inactiveData, filter]);

  useEffect(() => {
    setPageData(
      sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [sortedData, currentPage]);

  const handleSort = (key: keyof Validator) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

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
          {pageData.map((row, index) => (
            <tr key={index} className="border-t text-left hover:bg-gray-50">
              <td className="p-3 font-mono text-sm">{row.validator_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
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
    </div>
  );
};

export default SortableTable;
