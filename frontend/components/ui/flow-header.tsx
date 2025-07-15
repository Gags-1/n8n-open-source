import { ArrowLeft, Share2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlowHeaderProps {
  flowName?: string;
  flowDescription?: string;
  onNavigateBack?: () => void;
  onShareClick: () => void;
}

export function FlowHeader({
  flowName,
  flowDescription,
  onNavigateBack,
  onShareClick,
}: FlowHeaderProps) {
  // Only show if we have flow info
  if (!flowName && !onNavigateBack) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        {onNavigateBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateBack}
            className="h-6 w-6 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
        )}
        <div>
          <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {flowName || "Untitled Flow"}
          </h1>
          {flowDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {flowDescription}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onShareClick}
          className="h-6 px-2 text-xs text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
        >
          <Share2 className="h-2.5 w-2.5 mr-1" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
        >
          <Settings className="h-2.5 w-2.5 mr-1" />
          Settings
        </Button>
      </div>
    </div>
  );
}
