import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NodeDeleteButton } from "../node-delete-button";
import { useState, useEffect } from "react";

interface ContextNodeData {
  value?: string;
  label?: string;
  onChange?: (value: string) => void;
  onDelete?: (nodeId: string) => void;
}

interface ContextNodeProps {
  data: ContextNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function ContextNode({ data, id, selected, onDelete }: ContextNodeProps) {
  const [value, setValue] = useState(data.value || "");

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (data.onChange) {
      data.onChange(newValue);
    }
  };

  useEffect(() => {
    setValue(data.value || "");
  }, [data.value]);

  return (
    <Card
      className={`w-80 shadow-sm border-0 bg-white dark:bg-slate-900 transition-all duration-300 group ${
        selected
          ? "ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/10"
          : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60"
      }`}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {data.label || "Context"}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Context Information
              </p>
            </div>
          </div>
          <NodeDeleteButton onDelete={handleDelete} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label
            htmlFor={`context-value-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Context
          </Label>
          <Textarea
            id={`context-value-${id}`}
            placeholder="Enter context information..."
            className="min-h-20 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none"
            value={value}
            onChange={handleValueChange}
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${value ? "bg-orange-500" : "bg-slate-400"}`}></div>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Status
            </span>
          </div>
          <p className="leading-relaxed">
            {value ? "Context provided" : "No context provided"}
          </p>
        </div>
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-sm"
      />
    </Card>
  );
}
