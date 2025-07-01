import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiExternalLink } from "react-icons/fi";

export interface Validator {
  id: number;
  validator_name: string;
  name: string;
  commission: number;
  slot_number?: number | null;
  proposer_pubkey?: string | null;
  preconfs_enabled?: boolean | null;
  slashing_enabled?: boolean | null;
  signed_delegation?: string | null; // JSON as string
  signed_registration?: string | null; // JSON as string
}

interface SortableTableProps {
  activeData: Validator[];
  inactiveData: Validator[];
}

const columns: { label: string; key: keyof Validator }[] = [
  { label: "Validator Address", key: "validator_name" },
  { label: "Validator Name", key: "name" },
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
  const [operatorNames, setOperatorNames] = useState<{ [key: string]: string }>({});
  const itemsPerPage = 1000;

  // Function to fetch operator names from database in batches
  const fetchOperatorNames = async (addresses: string[]) => {
    try {
      // Split addresses into batches of 1000 to avoid body size limits
      const batchSize = 1000;
      const batches = [];
      for (let i = 0; i < addresses.length; i += batchSize) {
        batches.push(addresses.slice(i, i + batchSize));
      }

      const allOperatorNames: { [key: string]: string } = {};

      // Process each batch
      for (const batch of batches) {
        const response = await fetch('/api/operator-names', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ addresses: batch }),
        });
        
        if (response.ok) {
          const data = await response.json();
          Object.assign(allOperatorNames, data);
        } else {
          console.error('Failed to fetch operator names for batch');
        }
      }

      setOperatorNames(allOperatorNames);
    } catch (error) {
      console.error('Error fetching operator names:', error);
    }
  };

  useEffect(() => {
    const filteredData = filter === "active" ? activeData : inactiveData;

    const sorted = [...filteredData].sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      
      // Handle null or undefined values
      if (a[key] === null || a[key] === undefined) return direction === "asc" ? 1 : -1;
      if (b[key] === null || b[key] === undefined) return direction === "asc" ? -1 : 1;
      
      // Get values for comparison
      const aValue = a[key];
      const bValue = b[key];
      
      // Handle boolean values
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return direction === "asc"
          ? (aValue === bValue ? 0 : aValue ? -1 : 1)
          : (aValue === bValue ? 0 : aValue ? 1 : -1);
      }
      
      // Handle number values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      const aString = String(aValue);
      const bString = String(bValue);
      
      return direction === "asc"
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });

    setSortedData(sorted);
    setCurrentPage(1); // reset page when filter or sort changes
    
    // Fetch operator names for all validator addresses
    const addresses = sorted.map(validator => validator.validator_name);
    if (addresses.length > 0) {
      fetchOperatorNames(addresses);
    }
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
              <td className="p-3 text-sm">
                {operatorNames[row.validator_name] || 'N/A'}
              </td>
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
