import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NodeDeleteButton } from "../node-delete-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

interface MongoDBNodeData {
  mongoUri?: string;
  collection?: string;
  operation?: string;
  query?: string;
  vectorField?: string;
  limit?: number;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
}

interface MongoDBNodeProps {
  data: MongoDBNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function MongoDBNode({ data, id, selected, onDelete }: MongoDBNodeProps) {
  const [formData, setFormData] = useState({
    mongoUri: data.mongoUri || "",
    collection: data.collection || "",
    operation: data.operation || "find",
    query: data.query || "",
    vectorField: data.vectorField || "",
    limit: data.limit || 10,
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
      mongoUri: data.mongoUri || "",
      collection: data.collection || "",
      operation: data.operation || "find",
      query: data.query || "",
      vectorField: data.vectorField || "",
      limit: data.limit || 10,
    });
  }, [data.mongoUri, data.collection, data.operation, data.query, data.vectorField, data.limit]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass: "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Executing database query..."
      };
    }
    if (data.executionStatus === 'completed') {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "Query completed successfully"
      };
    }
    if (data.executionStatus === 'error') {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "Database query failed"
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-green-500/20 shadow-lg shadow-green-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-green-500",
      statusText: "Ready to query database"
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm"
      />

      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="m8 2 1.88 1.88"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M14.12 3.88 16 2v5.76l-2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                MongoDB
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                NoSQL Database
              </p>
            </div>
          </div>
          <NodeDeleteButton onDelete={handleDelete} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            MongoDB URI
          </Label>
          <Input
            type="text"
            placeholder="mongodb://localhost:27017/database"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.mongoUri}
            onChange={(e) => handleInputChange("mongoUri", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Collection
          </Label>
          <Input
            type="text"
            placeholder="collection_name"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.collection}
            onChange={(e) => handleInputChange("collection", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Operation
          </Label>
          <Select value={formData.operation} onValueChange={(value) => handleInputChange("operation", value)}>
            <SelectTrigger className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500/20 text-slate-900 dark:text-slate-100 transition-all duration-200">
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
              <SelectItem value="find" className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700">
                Find Documents
              </SelectItem>
              <SelectItem value="vector_search" className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700">
                Vector Search
              </SelectItem>
              <SelectItem value="insert_one" className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700">
                Insert Document
              </SelectItem>
              <SelectItem value="update_one" className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700">
                Update Document
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Query
          </Label>
          <Textarea
            placeholder='{"field": "value"}'
            className="min-h-16 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none"
            value={formData.query}
            onChange={(e) => handleInputChange("query", e.target.value)}
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm"
      />
    </Card>
  );
}