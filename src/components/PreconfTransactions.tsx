import { useEffect, useState, useMemo } from "react";
import SortableTable, { Validator } from "../components/SortableTable";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiExternalLink } from "react-icons/fi";

interface PreconfTransactionsProps {
  searchQuery: string;
}

interface Transaction {
  id: string;
  hash: string;
  timestamp: string;
  status: string;
  value: string;
}

const TransactionBlock: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}) => {
  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-xl border border-neutral-200 p-4 text-sm">
      <span>{title}</span>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};

export const PreconfTransactions = ({ searchQuery }: PreconfTransactionsProps) => {
  const { isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVolume] = useState(() => {
    return "$1.2M";
  });

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    return transactions.filter((tx) =>
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate successful data fetch with mock data
        const mockTransactions: Transaction[] = Array.from({ length: 10 }, (_, index) => ({
          id: `tx-${index + 1}`,
          hash: `0x${Math.random().toString(16).slice(2, 42)}`,
          timestamp: new Date().toISOString(),
          status: Math.random() > 0.1 ? 'success' : 'pending',
          value: `${(Math.random() * 10).toFixed(4)} ETH`
        }));

        if (!isMounted) return;
        
        setTransactions(mockTransactions);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching transactions:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch transactions");
        setIsLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="flex w-full flex-col items-center gap-8">
        <div className="w-full p-4 text-red-500 bg-red-50 rounded-xl">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-2xl font-bold">Preconf Transactions</h3>
          <a 
            href="https://hoodi.explorer.interstate.so" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View on Hoodi Block Explorer
            <FiExternalLink className="w-4 h-4" />
          </a>
        </div>
        <div className="flex min-h-16 w-full flex-col items-center justify-center rounded-xl border border-neutral-200 p-8 text-sm">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-4">
              <h4>Connect your wallet to view transactions.</h4>
              <ConnectButton />
            </div>
          ) : (
            "Your Transactions"
          )}
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <h3 className="text-2xl font-bold">All Transactions</h3>
        {isLoading ? (
          <div className="w-full p-4 text-gray-500 bg-gray-50 rounded-xl">
            Loading transactions...
          </div>
        ) : (
          <>
            <div className="flex w-full flex-row gap-3">
              <TransactionBlock title="Total Volume" value={totalVolume} />
              <TransactionBlock 
                title="Total Transactions" 
                value={filteredTransactions.length.toString()} 
              />
            </div>
            <div className="flex w-full flex-row gap-4">
              <TransactionBlock
                title="Success Rate"
                value="98.5%"
              />
              <TransactionBlock
                title="Average Time"
                value="2.5s"
              />
            </div>
            <SortableTable 
              activeData={filteredTransactions.map((tx, index) => ({
                id: index + 1,
                validator_name: tx.hash,
                commission: 0
              }))} 
              inactiveData={[]} 
              searchQuery={searchQuery}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PreconfTransactions;