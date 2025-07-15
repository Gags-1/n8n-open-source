import { Handle, Position } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { NodeDeleteButton } from "../node-delete-button";

interface EmailNodeData {
  fromEmail?: string;
  toEmail?: string;
  smtpServer?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  subject?: string;
  onChange?: (field: string, value: any) => void;
  onDelete?: (nodeId: string) => void;
  isExecuting?: boolean;
  executionStatus?: "executing" | "completed" | "error";
}

interface EmailNodeProps {
  data: EmailNodeData;
  id: string;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
}

export function EmailNode({ data, id, selected, onDelete }: EmailNodeProps) {
  const [formData, setFormData] = useState({
    fromEmail: data.fromEmail || "",
    toEmail: data.toEmail || "",
    smtpServer: data.smtpServer || "smtp.gmail.com",
    smtpPort: data.smtpPort || 587,
    username: data.username || "",
    password: data.password || "",
    subject: data.subject || "Workflow Output",
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    const newFormData = { ...formData, [field]: value };

    // Handle special case for SMTP port
    if (field === "smtpServer") {
      const port = value === "smtp.gmail.com" ? 587 : 587;
      newFormData.smtpPort = port;
      if (data.onChange) {
        data.onChange("smtpPort", port);
      }
    }
    setFormData(newFormData);

    if (data.onChange) {
      data.onChange(field, value);
    }
  };

  useEffect(() => {
    setFormData({
      fromEmail: data.fromEmail || "",
      toEmail: data.toEmail || "",
      smtpServer: data.smtpServer || "smtp.gmail.com",
      smtpPort: data.smtpPort || 587,
      username: data.username || "",
      password: data.password || "",
      subject: data.subject || "Workflow Output",
    });
  }, [
    data.fromEmail,
    data.toEmail,
    data.smtpServer,
    data.smtpPort,
    data.username,
    data.password,
    data.subject,
  ]);

  // Get execution state styling
  const getExecutionStyling = () => {
    if (data.isExecuting) {
      return {
        cardClass:
          "ring-2 ring-yellow-500/40 shadow-lg shadow-yellow-500/20 animate-pulse",
        statusColor: "bg-yellow-500",
        statusText: "Sending email...",
      };
    }
    if (data.executionStatus === "completed") {
      return {
        cardClass:
          "ring-2 ring-green-500/40 shadow-lg shadow-green-500/20",
        statusColor: "bg-green-500",
        statusText: "Email sent successfully",
      };
    }
    if (data.executionStatus === "error") {
      return {
        cardClass: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/20",
        statusColor: "bg-red-500",
        statusText: "Failed to send email",
      };
    }
    return {
      cardClass: selected
        ? "ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/10"
        : "ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:shadow-md hover:ring-slate-300/60 dark:hover:ring-slate-600/60",
      statusColor: "bg-orange-500",
      statusText: "Ready to send emails",
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-sm"
      />

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
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="m22 6-10 7L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Email
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send Notifications
              </p>
            </div>
          </div>
          <NodeDeleteButton onDelete={handleDelete} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            From Email
          </Label>
          <Input
            type="email"
            placeholder="your-email@gmail.com"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.fromEmail}
            onChange={(e) => handleInputChange("fromEmail", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            To Email
          </Label>
          <Input
            type="email"
            placeholder="recipient@example.com"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.toEmail}
            onChange={(e) => handleInputChange("toEmail", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            SMTP Server
          </Label>
          <Select
            value={formData.smtpServer}
            onValueChange={(value) => handleInputChange("smtpServer", value)}
          >
            <SelectTrigger className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 text-slate-900 dark:text-slate-100 transition-all duration-200">
              <SelectValue placeholder="Select SMTP server" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
              <SelectItem
                value="smtp.gmail.com"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Gmail
              </SelectItem>
              <SelectItem
                value="smtp.outlook.com"
                className="text-slate-900 dark:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-700"
              >
                Outlook
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Username
          </Label>
          <Input
            type="text"
            placeholder="Username (usually your email)"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Password
          </Label>
          <Input
            type="password"
            placeholder="App password"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Subject
          </Label>
          <Input
            type="text"
            placeholder="Email subject"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            SMTP Port
          </Label>
          <Input
            type="number"
            placeholder="587"
            className="h-7 text-xs border-0 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-slate-750 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
            value={formData.smtpPort}
            onChange={(e) =>
              handleInputChange("smtpPort", parseInt(e.target.value) || 587)
            }
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
        className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-sm"
      />
    </Card>
  );
}
