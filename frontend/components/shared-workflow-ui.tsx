"use client";

import { Share2, Loader, X } from "lucide-react";

interface SharedWorkflowUIProps {
  isSharedWorkflow: boolean;
  sharedLoading: boolean;
  sharedError: string | null;
  sharedPermission: "view" | "edit";
  nodesCount: number;
}

export function SharedWorkflowUI({
  isSharedWorkflow,
  sharedLoading,
  sharedError,
  sharedPermission,
  nodesCount,
}: SharedWorkflowUIProps) {
  if (!isSharedWorkflow) {
    return null;
  }

  return (
    <>
      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 z-50 bg-black text-white text-xs p-2 rounded font-mono max-w-xs">
          <div>isSharedWorkflow: {String(isSharedWorkflow)}</div>
          <div>sharedLoading: {String(sharedLoading)}</div>
          <div>sharedError: {sharedError || 'null'}</div>
          <div>nodesCount: {nodesCount}</div>
          <div>sharedPermission: {sharedPermission}</div>
        </div>
      )}

      {/* Loading State for Shared Workflows */}
      {sharedLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-gray-50/90 dark:bg-gray-900/90">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Loader className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Loading Shared Workflow
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Please wait while we load the shared workflow...
            </p>
          </div>
        </div>
      )}

      {/* Error State for Shared Workflows */}
      {sharedError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-gray-50/90 dark:bg-gray-900/90">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Failed to Load Workflow
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              {sharedError}. The shared workflow link may be invalid or the workflow may have been deleted.
            </p>
          </div>
        </div>
      )}

      {/* Empty State for Shared Workflows */}
      {nodesCount === 0 && !sharedLoading && !sharedError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 bg-gray-50/90 dark:bg-gray-900/90">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Share2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Empty Shared Workflow
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              This shared workflow appears to be empty or contains no nodes.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
