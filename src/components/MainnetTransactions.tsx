import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiExternalLink } from "react-icons/fi";
import SearchBar from "./SearchBar";

interface Transaction {
  tx_hash: string;
  slot: number;
  timestamp: string;
}

const MainnetTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1000;

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredTransactions(transactions);
      return;
    }
    const filtered = transactions.filter(tx => 
      tx.tx_hash.toLowerCase().includes(query.toLowerCase()) ||
      tx.slot.toString().includes(query)
    );
    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Mainnet Transactions</h3>
      
      </div>
      
      {isLoading ? (
        <div className="w-full p-4 text-gray-500 bg-gray-50 rounded-xl">
          Loading transactions...
        </div>
      ) : (
        <>
          <SearchBar onSearch={handleSearch} placeholder="Search by transaction hash or slot..." />
          <table className="w-full rounded-lg border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-left">Transaction Hash</th>
                <th className="p-3 text-left">Timestamp</th>
                <th className="p-3 text-left">Slot</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, index) => (
                  <tr key={index} className="border-t text-left hover:bg-gray-50">
                    <td className="p-3 font-mono">{tx.tx_hash}</td>
                    <td className="p-3">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="p-3">{tx.slot}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Pagination */}
      <div className="ml-auto mr-0 mt-4 flex w-1/6 justify-between text-xs">
        <button
          disabled={true}
          className="rounded border px-4 py-2 cursor-not-allowed bg-gray-300"
        >
          <FiChevronLeft />
        </button>
        <span className="py-2">
          Page 1 of 1
        </span>
        <button
          disabled={true}
          className="rounded border px-4 py-2 cursor-not-allowed bg-gray-300"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default MainnetTransactions; 