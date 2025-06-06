import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaCoins } from "react-icons/fa";

export const Header = () => {
  return (
    <div className="flex w-full flex-row justify-between border-b border-neutral-200 px-4 py-3">
      <h3 className="flex items-center gap-3 text-xl font-bold">
        <FaCoins size={20} />
        Validator
      </h3>
      <ConnectButton />
    </div>
  );
};
