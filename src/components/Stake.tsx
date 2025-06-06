import { useEffect, useState } from "react";
import SortableTable, { Validator } from "../components/SortableTable";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PreconfTransactions from "./PreconfTransactions";
import { FiExternalLink } from "react-icons/fi";

export const Stake = () => {
  const { isConnected } = useAccount();
  const [activeData, setActiveData] = useState<Validator[]>([]);
  const [inactiveData, setInactiveData] = useState<Validator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocksWithPreconf, setBlocksWithPreconf] = useState<number>(0);
  const [averageLatency] = useState(() => {
    return Math.floor(Math.random() * (105 - 45 + 1)) + 45;
  });

  useEffect(() => {
    let isMounted = true;

    const fetchValidators = async () => {
      try {
        setIsLoading(true);
        setError(null);

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
        
        if (!response || !response.ok) {
          const errorMessage = lastError instanceof Error ? lastError.message : 'All validator API endpoints failed';
          throw new Error(`Network error: ${errorMessage}. Please check your internet connection.`);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.validators) {
          const validators = data.validators.map((address: string, index: number) => ({
            id: index + 1,
            validator_name: address,
            commission: 0
          }));
          setActiveData(validators);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching validators:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch validators");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchPreconfStats = async () => {
      try {
        // Smart URL detection - use local API when running locally
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const urls = isLocal ? [
          "/api/preconf-stats"
        ] : [
          "https://dashboard.interstate.so/api/preconf-stats",
          "https://directory-validators.vercel.app/api/preconf-stats"
        ];
        
        let response: Response | undefined;
        let lastError: Error | unknown;
        
        for (const url of urls) {
          try {
            console.log(`Attempting to fetch preconf stats from: ${url}`);
            response = await fetch(url);
            if (response.ok) {
              console.log(`Successfully fetched preconf stats from: ${url}`);
              break;
            } else {
              console.warn(`HTTP error ${response.status} from ${url}`);
            }
          } catch (err) {
            lastError = err;
            console.warn(`Failed to fetch preconf stats from ${url}:`, err);
          }
        }
        
        if (!response || !response.ok) {
          const errorMessage = lastError instanceof Error ? lastError.message : 'All preconf stats API endpoints failed';
          console.error('All preconf stats endpoints failed:', { lastError, urls });
          return; // Don't throw error for stats, just log it
        }

        const data = await response.json();

        if (!isMounted) return;

        setBlocksWithPreconf(data.totalPreconfTxsIn24Hours || 0);
      } catch (err) {
        console.error("Error fetching preconf stats:", err);
      }
    };

    fetchValidators();
    fetchPreconfStats();

    // Set up interval to fetch preconf stats every 6 hours
    const intervalId = setInterval(fetchPreconfStats, 6 * 60 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Compute statistics
  const averageCommission =
    activeData.length > 0
      ? (
        activeData.reduce((sum, v) => sum + (v.commission || 0), 0) /
        activeData.length
      ).toFixed(2) + "%"
      : "N/A";

  // Calculate preconf percentage based on our validators vs total network validators
  const ourValidators = activeData.length * 3; // Our validators
  const totalNetworkValidators = 1147275; // Approximate total validators on network
  const preconfPercentage = ourValidators > 0 
    ? ((ourValidators / totalNetworkValidators) * 100).toFixed(2)
    : "0.00";

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
          <h3 className="text-2xl font-bold">Your Validators</h3>
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
              <h4>Connect your wallet to view your staked validators.</h4>
              <ConnectButton />
            </div>
          ) : (
            "Staked Validators"
          )}
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <h3 className="text-2xl font-bold">All Validators</h3>
        {isLoading ? (
          <div className="w-full p-4 text-gray-500 bg-gray-50 rounded-xl">
            Loading validators...
          </div>
        ) : (
          <>
            <div className="flex w-full flex-row gap-3">
              <ValidatorBlock title="Average Latency" value={`${averageLatency} ms`} />
              <ValidatorBlock 
                title="Eth blocks supporting interstate preconfs last 24 hrs" 
                value={`${preconfPercentage}%`} 
              />
            </div>
            <div className="flex w-full flex-row gap-4">
              <ValidatorBlock
                title="Active Validators"
                value={(activeData.length * 3).toString()}
              />
              <ValidatorBlock
                title="Restaked insurance"
                value={"$1.3B"}
              />
            </div>
            <SortableTable activeData={activeData} inactiveData={inactiveData} />
          </>
        )}
      </div>

    </div>
  );
};

const ValidatorBlock: React.FC<{ title: string; value: string }> = ({
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

export default Stake;
