import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeDeleteButton } from "../node-delete-button";
import { FileType2 } from "lucide-react";
import { useState, useEffect } from "react";

interface PdfNodeData {
  filename?: string;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
}

interface PdfNodeProps {
  data: PdfNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function PdfNode({ data, id, selected, onDelete }: PdfNodeProps) {
  const [filename, setFilename] = useState(data.filename || "output.pdf");

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFilename(newValue);
    if (data.onChange) {
      data.onChange("filename", newValue);
    }
  };

  useEffect(() => {
    setFilename(data.filename || "output.pdf");
  }, [data.filename]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Generating PDF...",
      };
    }
    if (data.executionStatus === "completed") {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "PDF generated",
      };
    }
    if (data.executionStatus === "error") {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "PDF generation failed",
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-red-500",
      statusText: "Ready to generate PDF",
    };
  };

  const executionStyling = getExecutionStyling();

  return (
    <Card
      className={`w-80 shadow-sm border-0 bg-white dark:bg-slate-900 transition-all duration-300 group ${executionStyling.cardClass}`}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
              <FileType2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                PDF Generator
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate PDF documents
              </p>
            </div>
          </div>
          <NodeDeleteButton onDelete={handleDelete} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5 relative">
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{ left: "-17px", top: "8px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-start px-3 text-xs bg-red-50/50 dark:bg-red-950/20 rounded-md border border-red-100 dark:border-red-700/50 text-red-600 dark:text-red-400">
            Input from previous node
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`pdf-filename-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Filename
          </Label>
          <Input
            id={`pdf-filename-${id}`}
            placeholder="Enter filename (e.g., report.pdf)"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-red-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={filename}
            onChange={handleFilenameChange}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The PDF will contain the text content from the previous node.
          </p>
        </div>

        <div className="relative mt-5">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ right: "-17px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-end px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
            PDF Output
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
