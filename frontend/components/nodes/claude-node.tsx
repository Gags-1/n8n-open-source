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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface ClaudeNodeData {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
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

interface ClaudeNodeProps {
  data: ClaudeNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function ClaudeNode({ data, id, selected, onDelete }: ClaudeNodeProps) {
  const [apiKey, setApiKey] = useState(data.apiKey || "");
  const [model, setModel] = useState(data.model || "claude-3-opus-20240229");
  const [maxTokens, setMaxTokens] = useState(data.maxTokens || 1024);
  const [input, setInput] = useState(data.input || "");
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [context, setContext] = useState(data.context || "");

  useEffect(() => {
    if (data.onChange) {
      if (data.connectedInputs?.input !== undefined) {
        const newValue = data.connectedInputs.input;
        setInput(newValue);
        data.onChange("input", newValue);
      }
      if (data.connectedInputs?.prompt !== undefined) {
        const newValue = data.connectedInputs.prompt;
        setPrompt(newValue);
        data.onChange("prompt", newValue);
      }
      if (data.connectedInputs?.context !== undefined) {
        const newValue = data.connectedInputs.context;
        setContext(newValue);
        data.onChange("context", newValue);
      }
    }
  }, [data.connectedInputs, data.onChange]);

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

  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 1024;
    setMaxTokens(newValue);
    if (data.onChange) {
      data.onChange("maxTokens", newValue);
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
    setModel(data.model || "claude-3-opus-20240229");
    setMaxTokens(data.maxTokens || 1024);
    setInput(data.input || "");
    setPrompt(data.prompt || "");
    setContext(data.context || "");
  }, [data.apiKey, data.model, data.maxTokens, data.input, data.prompt, data.context]);

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
        ? "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-amber-500",
      statusText: "Ready to process requests",
    };
  };

  const executionStyling = getExecutionStyling();

  // Check if fields are connected
  const isInputConnected = data.connectedInputs?.input !== undefined;
  const isPromptConnected = data.connectedInputs?.prompt !== undefined;
  const isContextConnected = data.connectedInputs?.context !== undefined;

  // Use connected values if available, otherwise use local state
  const displayInput = isInputConnected ? data.connectedInputs?.input || "" : input;
  const displayPrompt = isPromptConnected ? data.connectedInputs?.prompt || "" : prompt;
  const displayContext = isContextConnected ? data.connectedInputs?.context || "" : context;

  return (
    <Card
      className={`w-80 shadow-sm border-0 bg-white dark:bg-slate-900 transition-all duration-300 group ${executionStyling.cardClass}`}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
              <img
                src="/logo/claude.svg"
                alt="Claude"
                className="w-4 h-4 brightness-0 invert"
              />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Claude
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Constitutional AI
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
            htmlFor={`claude-input-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Input
            {isInputConnected && (
              <span className="text-xs text-green-600 dark:text-green-400">(Connected)</span>
            )}
          </Label>
          <Input
            id={`claude-input-${id}`}
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
            htmlFor={`claude-prompt-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Prompt
            {isPromptConnected && (
              <span className="text-xs text-purple-600 dark:text-purple-400">(Connected)</span>
            )}
          </Label>
          <Textarea
            id={`claude-prompt-${id}`}
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
            htmlFor={`claude-context-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Context
            {isContextConnected && (
              <span className="text-xs text-orange-600 dark:text-orange-400">(Connected)</span>
            )}
          </Label>
          <Textarea
            id={`claude-context-${id}`}
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
            htmlFor={`claude-api-key-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            API Key
          </Label>
          <Input
            id={`claude-api-key-${id}`}
            type="password"
            placeholder="Enter Anthropic API key"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={apiKey}
            onChange={handleApiKeyChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`claude-model-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Model
          </Label>
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger className="h-7 w-full text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-slate-100 transition-all duration-200">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
              <SelectItem
                value="claude-3-opus-20240229"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Claude 3 Opus
              </SelectItem>
              <SelectItem
                value="claude-3-sonnet-20240229"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Claude 3 Sonnet
              </SelectItem>
              <SelectItem
                value="claude-3-haiku-20240307"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Claude 3 Haiku
              </SelectItem>
              <SelectItem
                value="claude-2.1"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Claude 2.1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`claude-max-tokens-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Max Tokens
          </Label>
          <Input
            id={`claude-max-tokens-${id}`}
            type="number"
            min="1"
            max="4000"
            placeholder="1024"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={maxTokens}
            onChange={handleMaxTokensChange}
          />
        </div>

        <div className="relative mt-5">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ right: "-17px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-end px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
            Output
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
