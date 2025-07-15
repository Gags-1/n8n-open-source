import { Activity, Link, Clock } from "lucide-react";

interface StatusBarProps {
  nodesCount: number;
  edgesCount: number;
  lastSaved: string;
}

export function StatusBar({ nodesCount, edgesCount, lastSaved }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Activity className="h-2.5 w-2.5" />
          <span>{nodesCount} nodes</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Link className="h-2.5 w-2.5" />
          <span>{edgesCount} connections</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="h-2.5 w-2.5" />
        <span>
          {lastSaved ? `Last saved: ${lastSaved}` : "Auto-saving enabled"}
        </span>
      </div>
    </div>
  );
}
