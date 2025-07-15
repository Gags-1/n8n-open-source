import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { NodeDeleteButton } from "../node-delete-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

interface OpenAIAdvancedNodeData {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userPrompt?: string;
  context?: string;
  systemInstruction?: string;
  prompt?: string;
  input?: string;
  maxOutputTokens?: number;
  jsonMode?: boolean;
  stream?: boolean;
  connectedInputs?: {
    userPrompt?: string;
    input?: string;
    context?: string;
    systemInstruction?: string;
    prompt?: string;
  };
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
  getEffectiveUserPrompt?: () => string;
}

interface OpenAIAdvancedNodeProps {
  data: OpenAIAdvancedNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function OpenAIAdvancedNode({ data, id, selected, onDelete }: OpenAIAdvancedNodeProps) {
  const [apiKey, setApiKey] = useState(data.apiKey || "");
  const [model, setModel] = useState(data.model || "gpt-4-turbo-preview");
  const [temperature, setTemperature] = useState(data.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(data.maxTokens || 1024);
  const [userPrompt, setUserPrompt] = useState(data.userPrompt || data.input || "");
  const [context, setContext] = useState(data.context || "");
  const [systemInstruction, setSystemInstruction] = useState(data.systemInstruction || data.prompt || "");

  useEffect(() => {
    if (data.onChange) {
      // Handle userPrompt/input connections
      if (data.connectedInputs?.userPrompt !== undefined) {
        const newValue = data.connectedInputs.userPrompt;
        setUserPrompt(newValue);
        data.onChange("userPrompt", newValue);
        data.onChange("input", newValue); // Also update input for backward compatibility
      } else if (data.connectedInputs?.input !== undefined) {
        const newValue = data.connectedInputs.input;
        setUserPrompt(newValue);
        data.onChange("userPrompt", newValue);
        data.onChange("input", newValue);
      }
      
      // Handle prompt/systemInstruction connections
      if (data.connectedInputs?.systemInstruction !== undefined) {
        const newValue = data.connectedInputs.systemInstruction;
        setSystemInstruction(newValue);
        data.onChange("systemInstruction", newValue);
        data.onChange("prompt", newValue); // Also update prompt for backward compatibility
      } else if (data.connectedInputs?.prompt !== undefined) {
        const newValue = data.connectedInputs.prompt;
        setSystemInstruction(newValue);
        data.onChange("systemInstruction", newValue);
        data.onChange("prompt", newValue);
      }
      
      // Handle context connections
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

  const handleUserPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setUserPrompt(newValue);
    if (data.onChange) {
      data.onChange("userPrompt", newValue);
      data.onChange("input", newValue); // Also update input for backward compatibility
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

  const handleSystemInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setSystemInstruction(newValue);
    if (data.onChange) {
      data.onChange("systemInstruction", newValue);
      data.onChange("prompt", newValue); // Also update prompt for backward compatibility
    }
  };

  useEffect(() => {
    // Update local state if the corresponding data prop changes
    if (data.apiKey && data.apiKey !== apiKey) setApiKey(data.apiKey);
    if (data.model && data.model !== model) setModel(data.model);
    if (data.temperature && data.temperature !== temperature) setTemperature(data.temperature);
    if (data.maxTokens && data.maxTokens !== maxTokens) setMaxTokens(data.maxTokens);
    if ((data.userPrompt || data.input) && (data.userPrompt || data.input) !== userPrompt) setUserPrompt(data.userPrompt || data.input || "");
    if (data.context && data.context !== context) setContext(data.context);
    if ((data.systemInstruction || data.prompt) && (data.systemInstruction || data.prompt) !== systemInstruction) setSystemInstruction(data.systemInstruction || data.prompt || "");
  }, [data.apiKey, data.model, data.temperature, data.maxTokens, data.userPrompt, data.input, data.context, data.systemInstruction, data.prompt]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Processing advanced request...",
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
        ? "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-emerald-500",
      statusText: "Ready for advanced processing",
    };
  };

  const executionStyling = getExecutionStyling();

  // Check if fields are connected
  const isUserPromptConnected = data.connectedInputs?.userPrompt !== undefined || data.connectedInputs?.input !== undefined;
  const isContextConnected = data.connectedInputs?.context !== undefined;
  const isSystemInstructionConnected = data.connectedInputs?.systemInstruction !== undefined || data.connectedInputs?.prompt !== undefined;

  // Use connected values if available, otherwise use local state
  const displayUserPrompt = isUserPromptConnected ? 
    (data.connectedInputs?.userPrompt || data.connectedInputs?.input || "") : userPrompt;
  const displayContext = isContextConnected ? data.connectedInputs?.context || "" : context;
  const displaySystemInstruction = isSystemInstructionConnected 
    ? (data.connectedInputs?.systemInstruction || data.connectedInputs?.prompt || "") 
    : systemInstruction;

  // Expose effective user prompt for validation
  useEffect(() => {
    if (data.onChange) {
      data.onChange("getEffectiveUserPrompt", () => displayUserPrompt);
      data.onChange("effectiveUserPrompt", displayUserPrompt);
    }
  }, [displayUserPrompt, data.onChange]);

  return (
    <Card
      className={`w-80 shadow-sm border-0 bg-white dark:bg-slate-900 transition-all duration-300 group ${executionStyling.cardClass}`}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-sm">
              <img
                src="/logo/openai.svg"
                alt="OpenAI"
                className="w-4 h-4 brightness-0 invert"
              />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                OpenAI Advanced
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GPT with Advanced Features
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
            id="userPrompt"
            style={{ left: "-17px", top: "8px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm"
          />
          {/* Additional handle for backward compatibility */}
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{ left: "-17px", top: "8px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm"
          />
          <Label
            htmlFor={`openai-adv-user-prompt-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            User Prompt
            {isUserPromptConnected && (
              <span className="text-xs text-green-600 dark:text-green-400">(Connected)</span>
            )}
          </Label>
          <Textarea
            id={`openai-adv-user-prompt-${id}`}
            placeholder={isUserPromptConnected ? "Value from connected node" : "Enter user prompt or connect from another node..."}
            className={`min-h-16 text-xs border-0 focus:ring-2 focus:ring-green-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none ${
              isUserPromptConnected 
                ? "bg-green-50 dark:bg-green-950/20 cursor-not-allowed" 
                : "bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-750"
            }`}
            value={displayUserPrompt}
            onChange={handleUserPromptChange}
            disabled={isUserPromptConnected}
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
          {/* Additional handle for system instructions */}
          <Handle
            type="target"
            position={Position.Left}
            id="systemInstruction"
            style={{ left: "-17px", top: "8px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-violet-500 border-0 shadow-sm"
          />
          <Label
            htmlFor={`openai-adv-system-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Prompt Template
            {isSystemInstructionConnected && (
              <span className="text-xs text-purple-600 dark:text-purple-400">(Connected)</span>
            )}
          </Label>
          <Textarea
            id={`openai-adv-system-${id}`}
            placeholder={isSystemInstructionConnected ? "Value from connected node" : "Enter prompt template..."}
            className={`min-h-16 text-xs border-0 focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none ${
              isSystemInstructionConnected 
                ? "bg-purple-50 dark:bg-purple-950/20 cursor-not-allowed" 
                : "bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-750"
            }`}
            value={displaySystemInstruction}
            onChange={handleSystemInstructionChange}
            disabled={isSystemInstructionConnected}
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
            htmlFor={`openai-adv-context-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"
          >
            Context
            {isContextConnected && (
              <span className="text-xs text-orange-600 dark:text-orange-400">(Connected)</span>
            )}
          </Label>
          <Textarea
            id={`openai-adv-context-${id}`}
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
            htmlFor={`openai-adv-api-key-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            API Key
          </Label>
          <Input
            id={`openai-adv-api-key-${id}`}
            type="password"
            placeholder="Enter OpenAI API key"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={apiKey}
            onChange={handleApiKeyChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label
              htmlFor={`openai-adv-model-${id}`}
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Model
            </Label>
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="h-7 w-full text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 transition-all duration-200">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                <SelectItem
                  value="gpt-4-turbo-preview"
                  className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
                >
                  GPT-4 Turbo Preview
                </SelectItem>
                <SelectItem
                  value="gpt-4"
                  className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
                >
                  GPT-4
                </SelectItem>
                <SelectItem
                  value="gpt-3.5-turbo"
                  className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
                >
                  GPT-3.5 Turbo
                </SelectItem>
                <SelectItem
                  value="gpt-4-32k"
                  className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
                >
                  GPT-4 32K
                </SelectItem>
                <SelectItem
                  value="gpt-4-vision-preview"
                  className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
                >
                  GPT-4 Vision Preview
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`openai-adv-max-tokens-${id}`}
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Max Tokens
            </Label>
            <Input
              id={`openai-adv-max-tokens-${id}`}
              type="number"
              min="1"
              max="4000"
              placeholder="1024"
              className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
              value={maxTokens}
              onChange={handleMaxTokensChange}
            />
          </div>
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
              className="w-full [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-emerald-500 [&_[role=slider]]:shadow-sm"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 px-1">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id={`json-mode-${id}`}
              checked={data.jsonMode || false}
              onCheckedChange={(checked) => data.onChange?.("jsonMode", checked)}
            />
            <Label htmlFor={`json-mode-${id}`} className="text-xs font-medium text-slate-600 dark:text-slate-400">
              JSON Mode
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={`stream-${id}`}
              checked={data.stream || false}
              onCheckedChange={(checked) => data.onChange?.("stream", checked)}
            />
            <Label htmlFor={`stream-${id}`} className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Stream
            </Label>
          </div>
        </div>

        <div className="relative mt-5">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ right: "-17px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-green-500 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-end px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
            Output
          </div>
        </div>
      </CardContent>
    </Card>
  );
}