import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeDeleteButton } from "../node-delete-button";
import { useState, useEffect } from "react";

interface WebhookNodeData {
  webhookUrl?: string;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
}

interface WebhookNodeProps {
  data: WebhookNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function WebhookNode({
  data,
  id,
  selected,
  onDelete,
}: WebhookNodeProps) {
  const [webhookUrl, setWebhookUrl] = useState(data.webhookUrl || "");

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleWebhookUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setWebhookUrl(newValue);
    if (data.onChange) {
      data.onChange("webhookUrl", newValue);
    }
  };

  useEffect(() => {
    setWebhookUrl(data.webhookUrl || "");
  }, [data.webhookUrl]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Sending webhook...",
      };
    }
    if (data.executionStatus === "completed") {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "Webhook sent successfully",
      };
    }
    if (data.executionStatus === "error") {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "Webhook failed",
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-indigo-500",
      statusText: "Ready to send webhooks",
    };
  };

  const executionStyling = getExecutionStyling();

  return (
    <Card
      className={`w-80 shadow-sm border-0 bg-white dark:bg-slate-900 transition-all duration-300 group ${executionStyling.cardClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 border-0 shadow-sm"
      />

      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M13 3h6a2 2 0 0 1 2 2v6L13 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M13 21h6a2 2 0 0 0 2-2v-6L13 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M3 7v10a2 2 0 0 0 2 2h6l8-8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Webhook
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                HTTP Notifications
              </p>
            </div>
          </div>
          <NodeDeleteButton onDelete={handleDelete} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label
            htmlFor={`webhook-url-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Webhook URL
          </Label>
          <Input
            id={`webhook-url-${id}`}
            type="url"
            placeholder="https://example.com/webhook"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={webhookUrl}
            onChange={handleWebhookUrlChange}
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${executionStyling.statusColor} ${
                data.isExecuting ? "animate-pulse" : ""
              }`}
            ></div>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Status
            </span>
          </div>
          <p className="leading-relaxed">{executionStyling.statusText}</p>
        </div>
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 border-0 shadow-sm"
      />
    </Card>
  );
}
