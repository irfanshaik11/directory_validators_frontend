import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiExternalLink } from "react-icons/fi";

interface Transaction {
  tx_hash: string;
  slot: number;
  timestamp: string;
}

interface HoodiTransactionsProps {
  searchQuery?: string;
}

const HoodiTransactions = () => ({ searchQuery }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1000;
  
  const filtered = transactionType.filter((tx) => {
      tx.tx_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.slot.toString().includes(searchQuery)
    });
  }

  return (
    <div className="w-full">
    
      
      <table className="w-full rounded-lg border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 text-left">Transaction Hash</th>
            <th className="p-3 text-left">Timestamp</th>
            <th className="p-3 text-left">Slot</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="p-4 text-center text-gray-500">
              No transactions found
            </td>
          </tr>
        </tbody>
      </table>

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
  

export default HoodiTransactions; 