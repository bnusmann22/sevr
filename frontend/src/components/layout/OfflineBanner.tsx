import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  return (
    <div role="status" className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900 sm:px-6">
      <WifiOff className="h-4 w-4 flex-none" />
      Offline mode: cached workspace data is available; changes may not sync until you reconnect.
    </div>
  );
}