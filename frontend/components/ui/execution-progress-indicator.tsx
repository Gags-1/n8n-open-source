import { Loader } from "lucide-react";

interface ExecutionProgressIndicatorProps {
  isExecuting: boolean;
  executionProgress: {
    completed: string[];
    current: string | null;
    total: number;
  };
  currentExecutingNode: string | null;
  nodes: any[];
}

export function ExecutionProgressIndicator({
  isExecuting,
  executionProgress,
  currentExecutingNode,
  nodes,
}: ExecutionProgressIndicatorProps) {
  if (!isExecuting) return null;

  const currentNodeType = currentExecutingNode 
    ? nodes.find((n) => n.id === currentExecutingNode)?.type || "Unknown"
    : "Unknown";

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 min-w-[300px]">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full animate-spin"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Executing Workflow ({executionProgress.completed.length}/
              {executionProgress.total})
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (executionProgress.completed.length /
                      Math.max(executionProgress.total, 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            {currentExecutingNode && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Currently executing: {currentNodeType}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
