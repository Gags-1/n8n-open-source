import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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

interface GeminiNodeData {
  apiKey?: string;
  model?: string;
  temperature?: number;
  input?: string;
  prompt?: string;
  context?: string;
  connectedInputs?: {
    input?: string;
    prompt?: string;
    context?: string;
  };
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
}

interface GeminiNodeProps {
  data: GeminiNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function GeminiNode({ data, id, selected, onDelete }: GeminiNodeProps) {
  const [apiKey, setApiKey] = useState(data.apiKey || "");
  const [model, setModel] = useState(data.model || "gemini-2.5-flash");
  const [temperature, setTemperature] = useState(data.temperature || 0.7);
  const [input, setInput] = useState(data.input || "");
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [context, setContext] = useState(data.context || "");

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setApiKey(newValue);
    if (data.onChange) {
      data.onChange("apiKey", newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (data.onChange) {
      data.onChange("input", newValue);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    if (data.onChange) {
      data.onChange("prompt", newValue);
    }
  };

  const handleModelChange = (newValue: string) => {
    setModel(newValue);
    if (data.onChange) {
      data.onChange("model", newValue);
    }
  };

  const handleTemperatureChange = (values: number[]) => {
    const newValue = values[0];
    setTemperature(newValue);
    if (data.onChange) {
      data.onChange("temperature", newValue);
    }
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContext(newValue);
    if (data.onChange) {
      data.onChange("context", newValue);
    }
  };

  useEffect(() => {
    setApiKey(data.apiKey || "");
    setModel(data.model || "gemini-2.5-flash");
    setTemperature(data.temperature || 0.7);
    setInput(data.input || "");
    setPrompt(data.prompt || "");
    setContext(data.context || "");
  }, [data.apiKey, data.model, data.temperature, data.input, data.prompt, data.context]);

  // Check if fields are connected
  const isInputConnected = data.connectedInputs?.input !== undefined;
  const isPromptConnected = data.connectedInputs?.prompt !== undefined;
  const isContextConnected = data.connectedInputs?.context !== undefined;

  // Use connected values if available, otherwise use local state
  const displayInput = isInputConnected ? data.connectedInputs?.input || "" : input;
  const displayPrompt = isPromptConnected ? data.connectedInputs?.prompt || "" : prompt;
  const displayContext = isContextConnected ? data.connectedInputs?.context || "" : context;

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Processing request...",
      };
    }
    if (data.executionStatus === "completed") {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "Request completed",
      };
    }
    if (data.executionStatus === "error") {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "Request failed",
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-blue-500",
      statusText: "Ready to process requests",
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <img
                src="/logo/gemini.svg"
                alt="Gemini"
                className="w-4 h-4 brightness-0 invert"
              />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Gemini
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multimodal AI
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
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm"
          />
          <Label
            htmlFor={`gemini-input-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Input
            {isInputConnected && (
              <span className="text-xs text-green-600 dark:text-green-400">(Connected)</span>
            )}
          </Label>
          <Input
            id={`gemini-input-${id}`}
            placeholder={isInputConnected ? "Value from connected node" : "Enter input text or connect from another node..."}
            className={`h-8 text-xs border-0 focus:ring-2 focus:ring-green-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 ${
              isInputConnected 
                ? "bg-green-50 dark:bg-green-950/20 cursor-not-allowed" 
                : "bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-750"
            }`}
            value={displayInput}
            onChange={handleInputChange}
            disabled={isInputConnected}
          />
        </div>

        <div className="space-y-1.5 relative">
          <Handle
            type="target"
            position={Position.Left}
            id="prompt"
            style={{ left: "-17px", top: "8px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-violet-500 border-0 shadow-sm"
          />
          <Label
            htmlFor={`gemini-prompt-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Prompt
            {isPromptConnected && (
              <span className="text-xs text-purple-600 dark:text-purple-400">(Connected)</span>
            )}
          </Label>
          <Textarea
            id={`gemini-prompt-${id}`}
            placeholder={isPromptConnected ? "Value from connected node" : "Enter system prompt or connect from another node..."}
            className={`min-h-16 text-xs border-0 focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none ${
              isPromptConnected 
                ? "bg-purple-50 dark:bg-purple-950/20 cursor-not-allowed" 
                : "bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-750"
            }`}
            value={displayPrompt}
            onChange={handlePromptChange}
            disabled={isPromptConnected}
          />
        </div>

        <div className="space-y-1.5 relative">
          <Handle
            type="target"
            position={Position.Left}
            id="context"
            style={{ left: "-17px", top: "8px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-sm"
          />
          <Label
            htmlFor={`gemini-context-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Context
            {isContextConnected && (
              <span className="text-xs text-orange-600 dark:text-orange-400">(Connected)</span>
            )}
          </Label>
          <Textarea
            id={`gemini-context-${id}`}
            placeholder={isContextConnected ? "Value from connected node" : "Enter context information or connect from another node..."}
            className={`min-h-16 text-xs border-0 focus:ring-2 focus:ring-orange-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none ${
              isContextConnected 
                ? "bg-orange-50 dark:bg-orange-950/20 cursor-not-allowed" 
                : "bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-750"
            }`}
            value={displayContext}
            onChange={handleContextChange}
            disabled={isContextConnected}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`gemini-api-key-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            API Key
          </Label>
          <Input
            id={`gemini-api-key-${id}`}
            type="password"
            placeholder="Enter Google API key"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={apiKey}
            onChange={handleApiKeyChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`gemini-model-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Model
          </Label>
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger className="h-7 w-full text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 transition-all duration-200">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
              <SelectItem
                value="gemini-1.5-flash"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Gemini 1.5 Flash
              </SelectItem>
              <SelectItem
                value="gemini-1.5-pro"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Gemini 1.5 Pro
              </SelectItem>
              <SelectItem
                value="gemini-2.5-flash"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Gemini 2.5 Flash
              </SelectItem>
              <SelectItem
                value="gemini-2.5-pro"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Gemini 2.5 Pro
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Temperature
            </Label>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {temperature}
            </span>
          </div>
          <div className="px-1">
            <Slider
              value={[temperature]}
              onValueChange={handleTemperatureChange}
              min={0}
              max={2}
              step={0.1}
              className="w-full [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-blue-500 [&_[role=slider]]:shadow-sm"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 px-1">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        <div className="relative mt-5">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ right: "-17px"}}
            className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-end px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
            Output
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
