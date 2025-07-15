import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeDeleteButton } from "../node-delete-button";
import { Clapperboard } from "lucide-react";
import { useState, useEffect } from "react";

interface VideoSummaryNodeData {
  apiKey?: string;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
  isSharedWorkflow?: boolean;
  sharedPermission?: "view" | "edit";
}

interface VideoSummaryNodeProps {
  data: VideoSummaryNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function VideoSummaryNode({ data, id, selected, onDelete }: VideoSummaryNodeProps) {
  const isReadOnly = data.isSharedWorkflow && data.sharedPermission === "view";

  const handleDelete = () => {
    if (isReadOnly) return;
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (isReadOnly || !data.onChange) return;
    data.onChange(field, value);
  };

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20 animate-pulse",
        statusColor: "bg-red-500",
        statusText: "Processing video transcript...",
      };
    }
    if (data.executionStatus === "completed") {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "Video summary completed",
      };
    }
    if (data.executionStatus === "error") {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "Video summary failed",
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-red-500",
      statusText: "Ready to process video",
    };
  };

  const executionStyling = getExecutionStyling();

  return (
    <Card
      className={`w-80 shadow-sm border-0 bg-white dark:bg-slate-900 transition-all duration-300 group ${executionStyling.cardClass}`}
    >
      <CardHeader className="pb-3 px-4 pt-4">          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-sm">
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Video Summary
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI-powered YouTube video summarization
              </p>
            </div>
          </div>
          {!isReadOnly && (
            <NodeDeleteButton onDelete={handleDelete} />
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5 relative">
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{ left: "-17px", top: "8px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-start px-3 text-xs bg-red-50/50 dark:bg-red-950/20 rounded-md border border-red-100 dark:border-red-700/50 text-red-600 dark:text-red-400">
            YouTube URL from previous node
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-apikey`} className="text-xs font-medium text-slate-700 dark:text-slate-300">
            OpenAI API Key
          </Label>
          <Input
            id={`${id}-apikey`}
            type="password"
            placeholder="sk-..."
            value={data.apiKey || ""}
            onChange={(e) => handleInputChange("apiKey", e.target.value)}
            disabled={isReadOnly}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300">Backend Process:</h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>• Extracts video ID from YouTube URL</li>
            <li>• Fetches transcript using YouTube Transcript API</li>
            <li>• Generates 3-bullet-point summary using OpenAI</li>
            <li>• Returns structured output with status</li>
          </ul>
        </div>

        <div className="relative mt-5">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ right: "-17px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-end px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
            Summary JSON Output
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
