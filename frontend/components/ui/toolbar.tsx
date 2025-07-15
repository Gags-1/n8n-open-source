import { Play, Save, Loader, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface ToolbarProps {
  isExecuting: boolean;
  nodesCount: number;
  isSharedWorkflow: boolean;
  sharedPermission: "view" | "edit";
  onExecuteWorkflow: () => void;
  onSave: () => void;
}

export function Toolbar({
  isExecuting,
  nodesCount,
  isSharedWorkflow,
  sharedPermission,
  onExecuteWorkflow,
  onSave,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Button
          onClick={onExecuteWorkflow}
          disabled={isExecuting || nodesCount === 0}
          size="icon"
          className="h-7 px-3 text-xs bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 shadow-sm"
        >
          {isExecuting ? (
            <div className=" animate-spin  ">
              <Loader className="h-3 w-3" />
            </div>
          ) : (
            <>
              <Play className="h-3 w-3" />
            </>
          )}
        </Button>
        <Button
          onClick={onSave}
          variant="outline"
          size="sm"
          disabled={isSharedWorkflow && sharedPermission === "view"}
          className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3 mr-1" />
          {isSharedWorkflow && sharedPermission === "view" ? "View Only" : "Save"}
        </Button>
        {isSharedWorkflow && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
            <Share2 className="h-3 w-3" />
            <span>Shared ({sharedPermission})</span>
          </div>
        )}
        <ThemeSwitcher />
      </div>
    </div>
  );
}
