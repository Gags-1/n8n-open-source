import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeDeleteButton } from "../node-delete-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

interface TextNodeData {
  filename?: string;
  savePath?: string;
  format?: string;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
}

interface TextNodeProps {
  data: TextNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function TextNode({ data, id, selected, onDelete }: TextNodeProps) {
  const [formData, setFormData] = useState({
    filename: data.filename || "workflow_output.txt",
    savePath: data.savePath || "/tmp",
    format: data.format || "txt",
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (data.onChange) {
      data.onChange(field, value);
    }
  };

  useEffect(() => {
    setFormData({
      filename: data.filename || "workflow_output.txt",
      savePath: data.savePath || "/tmp",
      format: data.format || "txt",
    });
  }, [data.filename, data.savePath, data.format]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass: "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Generating file..."
      };
    }
    if (data.executionStatus === 'completed') {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "File generated successfully"
      };
    }
    if (data.executionStatus === 'error') {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "File generation failed"
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-slate-500/20 shadow-lg shadow-slate-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-slate-500",
      statusText: "Ready to generate file"
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-slate-500 to-gray-500 border-0 shadow-sm"
      />

      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-sm">
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
                  x1="16"
                  y1="13"
                  x2="8"
                  y2="13"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="16"
                  y1="17"
                  x2="8"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Text File
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate Text File
              </p>
            </div>
          </div>
          <NodeDeleteButton onDelete={handleDelete} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Filename
          </Label>
          <Input
            type="text"
            placeholder="workflow_output.txt"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-slate-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.filename}
            onChange={(e) => handleInputChange("filename", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Save Path
          </Label>
          <Input
            type="text"
            placeholder="/tmp"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-slate-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.savePath}
            onChange={(e) => handleInputChange("savePath", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Format
          </Label>
          <Select value={formData.format} onValueChange={(value) => handleInputChange("format", value)}>
            <SelectTrigger className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-slate-500/20 text-slate-900 dark:text-slate-100 transition-all duration-200">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
              <SelectItem value="txt" className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700">
                Plain Text (.txt)
              </SelectItem>
              <SelectItem value="md" className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700">
                Markdown (.md)
              </SelectItem>
              <SelectItem value="json" className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700">
                JSON (.json)
              </SelectItem>
            </SelectContent>
          </Select>
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-slate-500 to-gray-500 border-0 shadow-sm"
      />
    </Card>
  );
}