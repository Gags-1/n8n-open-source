import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeDeleteButton } from "../node-delete-button";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface WhatsAppNodeData {
  twilio_sid?: string;
  twilio_token?: string;
  to_number?: string;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
}

interface WhatsAppNodeProps {
  data: WhatsAppNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function WhatsAppNode({ data, id, selected, onDelete }: WhatsAppNodeProps) {
  const [twilioSid, setTwilioSid] = useState(data.twilio_sid || "");
  const [twilioToken, setTwilioToken] = useState(data.twilio_token || "");
  const [toNumber, setToNumber] = useState(data.to_number || "");

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleTwilioSidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTwilioSid(newValue);
    if (data.onChange) {
      data.onChange("twilio_sid", newValue);
    }
  };

  const handleTwilioTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTwilioToken(newValue);
    if (data.onChange) {
      data.onChange("twilio_token", newValue);
    }
  };

  const handleToNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setToNumber(newValue);
    if (data.onChange) {
      data.onChange("to_number", newValue);
    }
  };

  useEffect(() => {
    setTwilioSid(data.twilio_sid || "");
    setTwilioToken(data.twilio_token || "");
    setToNumber(data.to_number || "");
  }, [data.twilio_sid, data.twilio_token, data.to_number]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Sending WhatsApp message...",
      };
    }
    if (data.executionStatus === "completed") {
      return {
        cardClass: "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "WhatsApp message sent",
      };
    }
    if (data.executionStatus === "error") {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "WhatsApp message failed",
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-green-500/20 shadow-lg shadow-green-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-green-500",
      statusText: "Ready to send WhatsApp message",
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                WhatsApp
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send WhatsApp messages via Twilio
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
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-600 to-green-700 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-start px-3 text-xs bg-green-50/50 dark:bg-green-950/20 rounded-md border border-green-100 dark:border-green-700/50 text-green-600 dark:text-green-400">
            Message content from previous node
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`whatsapp-twilio-sid-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Twilio Account SID
          </Label>
          <Input
            id={`whatsapp-twilio-sid-${id}`}
            type="password"
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={twilioSid}
            onChange={handleTwilioSidChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`whatsapp-twilio-token-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Twilio Auth Token
          </Label>
          <Input
            id={`whatsapp-twilio-token-${id}`}
            type="password"
            placeholder="Your Twilio auth token"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={twilioToken}
            onChange={handleTwilioTokenChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`whatsapp-to-number-${id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            To Number
          </Label>
          <Input
            id={`whatsapp-to-number-${id}`}
            placeholder="+1234567890"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={toNumber}
            onChange={handleToNumberChange}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Phone number with country code (e.g., +1234567890)
          </p>
        </div>

        <div className="relative mt-5">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ right: "-17px" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-600 to-green-700 border-0 shadow-sm"
          />
          <div className="h-8 flex items-center justify-end px-3 text-xs bg-slate-50/50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
            Status Output
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
