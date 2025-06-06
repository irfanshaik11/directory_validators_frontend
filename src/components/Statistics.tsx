import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface ProposerStats {
  average_response_latency: string;
  total_proposers: number;
  upcoming_slots: number;
  last_updated: string;
}

export const Statistics = () => {
  const { isConnected } = useAccount();
  const [stats, setStats] = useState<ProposerStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Smart URL detection - use local API when running locally
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const urls = isLocal ? [
          "/api/statistics"
        ] : [
          "https://dashboard.interstate.so/api/statistics",
          "https://directory-validators.vercel.app/api/statistics"
        ];
        
        let res: Response | undefined;
        let lastError: Error | unknown;
        
        for (const url of urls) {
          try {
            console.log(`Attempting to fetch statistics from: ${url}`);
            res = await fetch(url);
            if (res.ok) {
              console.log(`Successfully fetched statistics from: ${url}`);
              break;
            } else {
              console.warn(`HTTP error ${res.status} from ${url}`);
            }
          } catch (err) {
            lastError = err;
            console.warn(`Failed to fetch from ${url}:`, err);
          }
        }
        
        if (!res || !res.ok) {
          console.error("Failed to fetch statistics from all endpoints:", { lastError, urls });
          return;
        }
        
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex w-full flex-col gap-8 p-6">
      <h3 className="text-2xl font-bold">Holesky Proposer Statistics</h3>
      <p className="text-sm text-gray-500 -mt-6">
        Last Updated:{" "}
        {stats ? new Date(stats.last_updated).toLocaleString() : "Fetching..."}
      </p>

      <div className="flex w-full flex-row gap-4">
        <StatBlock
          title="Average Response Latency"
          value={stats ? stats.average_response_latency : "…"}
        />
        <StatBlock
          title="Total Proposers"
          value={stats ? stats.total_proposers.toLocaleString() : "…"}
        />
        <StatBlock
          title="Proposers in Next 32 Slots"
          value={stats ? stats.upcoming_slots.toString() : "…"}
        />
      </div>

      <div className="flex flex-col items-center gap-4 w-full p-6 border border-neutral-200 rounded-xl">
        {!isConnected ? (
          <div className="flex flex-col gap-4 items-center">
            <h4>Connect your wallet to access detailed validator insights.</h4>
            <ConnectButton />
          </div>
        ) : (
          <h4>Validator Details Coming Soon...</h4>
        )}
      </div>
    </div>
  );
};

const StatBlock: React.FC<{ title: string; value: string }> = ({ title, value }) => {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-neutral-200 p-4 text-sm">
      <span className="text-gray-600">{title}</span>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};
