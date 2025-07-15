import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeDeleteButton } from "../node-delete-button";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface OutputNodeData {
  format?: string;
  value?: string;
  label?: string;
  result?: string;
  timestamp?: string;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
  displayType?: "text" | "json" | "html";
}

interface OutputNodeProps {
  data: OutputNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function OutputNode({ data, id, selected, onDelete }: OutputNodeProps) {
  const [displayValue, setDisplayValue] = useState(
    data.value || data.result || ""
  );
  const [copied, setCopied] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleCopy = async () => {
    if (data.result) {
      await navigator.clipboard.writeText(data.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatResult = (result: string | undefined) => {
    if (!result) return "No output yet";

    if (data.displayType === "json") {
      try {
        return JSON.stringify(JSON.parse(result), null, 2);
      } catch {
        return result;
      }
    }

    return result;
  };

  useEffect(() => {
    setDisplayValue(data.value || data.result || "");
  }, [data.value, data.result]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Processing output...",
      };
    }
    if (data.executionStatus === "completed") {
      return {
        cardClass:
          "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "Output ready",
      };
    }
    if (data.executionStatus === "error") {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "Output error",
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-emerald-500",
      statusText: displayValue ? "Output ready" : "Waiting for results",
    };
  };

  const executionStyling = getExecutionStyling();

  return (
    <Card
      className={`w-96 shadow-sm border-0 bg-white dark:bg-slate-900 transition-all duration-300 group ${executionStyling.cardClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-green-500 border-0 shadow-sm"
      />

      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <polyline
                  points="14,2 14,8 20,8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="12"
                  y1="18"
                  x2="12"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="9"
                  y1="15"
                  x2="15"
                  y2="15"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {data.label || "Output"}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Workflow Result
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.result && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
            <NodeDeleteButton onDelete={handleDelete} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Result
            </span>
            {data.timestamp && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {data.timestamp}
              </span>
            )}
          </div>
          <div className="min-h-32 max-h-64 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <pre className="text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
              {formatResult(data.result)}
            </pre>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                data.result ? "bg-green-500" : "bg-slate-400"
              }`}
            ></div>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Status
            </span>
          </div>
          <p className="leading-relaxed">
            {data.result ? "Output received" : "Waiting for workflow execution"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
