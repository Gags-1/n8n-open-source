import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeDeleteButton } from "../node-delete-button";
import { useState, useEffect } from "react";

interface HashnodeNodeData {
  apiKey?: string;
  publicationId?: string;
  title?: string;
  slug?: string;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: 'executing' | 'completed' | 'error';
}

interface HashnodeNodeProps {
  data: HashnodeNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function HashnodeNode({
  data,
  id,
  selected,
  onDelete,
}: HashnodeNodeProps) {
  const [formData, setFormData] = useState({
    apiKey: data.apiKey || "",
    publicationId: data.publicationId || "",
    title: data.title || "AI Generated Post",
    slug: data.slug || "ai-generated-post",
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (data.onChange) {
      data.onChange(field, value);
    }
  };

  useEffect(() => {
    setFormData({
      apiKey: data.apiKey || "",
      publicationId: data.publicationId || "",
      title: data.title || "AI Generated Post",
      slug: data.slug || "ai-generated-post",
    });
  }, [
    data.apiKey,
    data.publicationId,
    data.title,
    data.slug,
  ]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass: "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Publishing article..."
      };
    }
    if (data.executionStatus === 'completed') {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "Article published successfully"
      };
    }
    if (data.executionStatus === 'error') {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "Failed to publish article"
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-cyan-500",
      statusText: "Ready to publish articles"
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 border-0 shadow-sm"
      />

      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
              <img
                src="/logo/hashnode.svg"
                alt="Hashnode"
                className="w-4 h-4 brightness-0 invert"
              />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Hashnode
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publishing Platform
              </p>
            </div>
          </div>
          <NodeDeleteButton onDelete={handleDelete} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            API Token
          </Label>
          <Input
            type="password"
            placeholder="Enter Hashnode API token"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.apiKey}
            onChange={(e) => handleInputChange("apiKey", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Publication ID
          </Label>
          <Input
            type="text"
            placeholder="Publication ID (optional)"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.publicationId}
            onChange={(e) => handleInputChange("publicationId", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Article Title
          </Label>
          <Input
            type="text"
            placeholder="AI Generated Post"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Article Slug
          </Label>
          <Input
            type="text"
            placeholder="ai-generated-post"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.slug}
            onChange={(e) => handleInputChange("slug", e.target.value)}
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${executionStyling.statusColor} ${data.isExecuting ? 'animate-pulse' : ''}`}></div>
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 border-0 shadow-sm"
      />
    </Card>
  );
}
