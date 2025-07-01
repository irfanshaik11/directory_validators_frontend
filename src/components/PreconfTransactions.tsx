import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiExternalLink } from "react-icons/fi";

interface Transaction {
  tx_hash: string;
  slot: number;
  timestamp: string;
}

interface Validator {
  id: number;
  validator_name: string;
  commission: number;
}

interface ApiResponse {
  transactions: Transaction[];
  totalPreconfTxsIn24Hours: number;
  label: string;
  debug?: any;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

const ValidatorBlock = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white w-full rounded-lg p-4 shadow-sm border border-gray-200">
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="text-2xl font-bold text-emerald-600">{value}</p>
  </div>
);

const PreconfTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeData, setActiveData] = useState<Validator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPreconfTxsIn24Hours, setTotalPreconfTxsIn24Hours] = useState(0);
  const itemsPerPage = 1000;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Smart URL detection - use local API when running locally
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const urls = isLocal ? [
          "/api/preconf-transactions"
        ] : [
          "https://dashboard.interstate.so/api/preconf-transactions",
          "https://directory-validators.vercel.app/api/preconf-transactions"
        ];
        
        let response: Response | undefined;
        let lastError: Error | unknown;
        let successfulUrl = '';
        
        for (const url of urls) {
          try {
            console.log(`Attempting to fetch from: ${url}`);
            response = await fetch(url);
            if (response.ok) {
              successfulUrl = url;
              console.log(`Successfully fetched from: ${url}`);
              break;
            } else {
              console.warn(`HTTP error ${response.status} from ${url}`);
            }
          } catch (err) {
            lastError = err;
            console.warn(`Failed to fetch from ${url}:`, err);
          }
        }
        
        if (!response || !response.ok) {
          const errorMessage = lastError instanceof Error ? lastError.message : 'All API endpoints failed';
          console.error('All endpoints failed:', { lastError, urls });
          throw new Error(`Network error: ${errorMessage}. Please check your internet connection.`);
        }

        const data: ApiResponse = await response.json();
        
        console.log("API Response data:", data);
        console.log("Debug info:", data.debug);

        // Extract transactions from the API response
        if (!data.transactions || !Array.isArray(data.transactions)) {
          throw new Error("Invalid data format received from server");
        }

        setTransactions(data.transactions);
        setTotalPreconfTxsIn24Hours(data.totalPreconfTxsIn24Hours || 0);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchValidators = async () => {
      try {
        // Smart URL detection - use local API when running locally
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const urls = isLocal ? [
          "/api/validators"
        ] : [
          "https://dashboard.interstate.so/api/validators",
          "https://directory-validators.vercel.app/api/validators"
        ];
        
        let response: Response | undefined;
        let lastError: Error | unknown;
        
        for (const url of urls) {
          try {
            console.log(`Attempting to fetch validators from: ${url}`);
            response = await fetch(url);
            if (response.ok) {
              console.log(`Successfully fetched validators from: ${url}`);
              break;
            } else {
              console.warn(`HTTP error ${response.status} from ${url}`);
            }
          } catch (err) {
            lastError = err;
            console.warn(`Failed to fetch validators from ${url}:`, err);
          }
        }

        if (response && response.ok) {
          const data = await response.json();
          if (data.validators) {
            const validators = data.validators.map((address: string, index: number) => ({
              id: index + 1,
              validator_name: address,
              commission: 0
            }));
            setActiveData(validators);
          }
        }
      } catch (err) {
        console.error("Error fetching validators:", err);
      }
    };

    fetchTransactions();
    fetchValidators();
  }, []);

  const pageData = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate preconf percentage based on our validators vs total network validators
  const ourValidators = activeData.length * 3; // Our validators
  const totalNetworkValidators = 1147275; // Approximate total validators on network
  const preconfPercentage = ourValidators > 0 
    ? ((ourValidators / totalNetworkValidators) * 100).toFixed(2)
    : "0.00";

  if (error) {
    return (
      <div className="w-full p-6 text-red-500 bg-red-50 rounded-xl border border-red-200">
        <h3 className="font-bold mb-3 text-lg">⚠️ Error Loading Transactions</h3>
        <p className="mb-4">{error}</p>
        <div className="text-sm text-red-700 mb-4">
          <p>This could be due to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Network connectivity issues</li>
            <li>API endpoints temporarily unavailable</li>
            <li>Database connection problems</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
  

      {/* Preconf Stats */}
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Eth blocks supporting interstate preconfs last 24 hrs</h4>
        <p className="text-3xl font-bold text-emerald-600">{`${preconfPercentage}%`} </p>
      </div>

      {isLoading ? (
        <div className="w-full p-4 text-gray-500 bg-gray-50 rounded-xl">
          Loading transactions...
        </div>
      ) : (
        <>
      
          <>
            <table className="w-full rounded-lg border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left">Transaction Hash</th>
                  <th className="p-3 text-left">Timestamp</th>
                  <th className="p-3 text-left">Slot</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  pageData.map((tx, index) => (
                    <tr key={index} className="border-t text-left hover:bg-gray-50">
                      <td className="p-3 font-mono">{tx.tx_hash}</td>
                      <td className="p-3">{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className="p-3">{tx.slot}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="ml-auto mr-0 mt-4 flex w-1/6 justify-between text-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className={`rounded border px-4 py-2 ${currentPage === 1
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-emerald-300 text-black hover:bg-emerald-400"
                  }`}
              >
                <FiChevronLeft />
              </button>
              <span className="py-2">
                Page {currentPage} of {Math.ceil(transactions.length / itemsPerPage)}
              </span>
              <button
                disabled={currentPage === Math.ceil(transactions.length / itemsPerPage)}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className={`rounded border px-4 py-2 ${currentPage === Math.ceil(transactions.length / itemsPerPage)
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-emerald-300 text-black hover:bg-emerald-400"
                  }`}
              >
                <FiChevronRight />
              </button>
            </div>
          </>
        </>
      )}
    </div>
  );
};

export default PreconfTransactions; 