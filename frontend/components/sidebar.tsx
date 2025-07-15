"use client";

import { useState } from "react";
import {
  Menu,
  FileInput,
  FileOutput,
  Bot,
  Sparkles,
  Brain,
  Mail,
  FileText,
  Webhook,
  ChevronRight,
  Layers,
  ChevronDown,
  Activity,
  FileType2,
  MessageCircle,
  Clapperboard,
  Pilcrow,
} from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  disabled?: boolean;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onDragStart,
  disabled = false,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Input & Output", "AI Models"]) // Default expanded categories
  );

  const nodeCategories = [
    {
      title: "Input & Output",
      icon: Layers,
      nodes: [
        {
          type: "workflowInput",
          label: "Input",
          icon: FileInput,
          color: "bg-blue-500",
        },
        {
          type: "prompt",
          label: "Prompt",
          icon: FileText,
          color: "bg-purple-500",
        },
        {
          type: "context",
          label: "Context",
          icon: FileText,
          color: "bg-orange-500",
        },
        {
          type: "workflowOutput",
          label: "Output",
          icon: FileOutput,
          color: "bg-emerald-500",
        },
        {
          type: "text-editor",
          label: "Text",
          icon: Pilcrow,
          color: "bg-gray-500",
        },
      ],
    },
    {
      title: "AI Models",
      icon: Bot,
      nodes: [
        {
          type: "openai-advanced",
          label: "OpenAI",
          icon: Bot,
          color: "bg-green-500",
        },
        {
          type: "gemini-advanced",
          label: "Gemini",
          icon: Sparkles,
          color: "bg-blue-500",
        },
        {
          type: "claude",
          label: "Claude",
          icon: Brain,
          color: "bg-purple-500",
        },
      ],
    },
    {
      title: "Communication",
      icon: Mail,
      nodes: [
        { type: "email", label: "Email", icon: Mail, color: "bg-orange-500" },
        {
          type: "whatsapp",
          label: "WhatsApp",
          icon: MessageCircle,
          color: "bg-green-600",
        },
      ],
    },
    {
      title: "Publishing",
      icon: FileText,
      nodes: [
        {
          type: "hashnode",
          label: "Hashnode",
          icon: FileText,
          color: "bg-cyan-500",
        },
        {
          type: "pdf",
          label: "PDF Generator",
          icon: FileType2,
          color: "bg-red-500",
        },
      ],
    },
    {
      title: "Content Processing",
      icon: Activity,
      nodes: [
        {
          type: "video-summary",
          label: "Video Summary",
          icon: Clapperboard,
          color: "bg-yellow-500",
        },
      ],
    },
    {
      title: "Database",
      icon: FileText,
      nodes: [
        {
          type: "mongodb",
          label: "MongoDB",
          icon: FileText,
          color: "bg-green-600",
        },
      ],
    },
    {
      title: "File Operations",
      icon: FileText,
      nodes: [
        {
          type: "text",
          label: "Text File",
          icon: FileText,
          color: "bg-slate-500",
        },
      ],
    },
    {
      title: "Integration",
      icon: Webhook,
      nodes: [
        {
          type: "webhook",
          label: "Webhook",
          icon: Webhook,
          color: "bg-indigo-500",
        },
      ],
    },
  ];

  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryTitle)) {
        newSet.delete(categoryTitle);
      } else {
        newSet.add(categoryTitle);
      }
      return newSet;
    });
  };

  return (
    <div className="flex relative">
      {/* Collapsed Sidebar Toggle Button */}
      {collapsed && (
        <div className="absolute left-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
          >
            Component
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-0" : "w-72"
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Components
              </h2>
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {disabled
                ? "View-only mode - editing disabled"
                : "Drag nodes to build your workflow"}
            </p>
          </div>

          <div className="py-2">
            {nodeCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.title);
              return (
                <div
                  key={category.title}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.title)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        {category.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Category Content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-3 pb-2 space-y-1">
                      {category.nodes.map((node) => {
                        const IconComponent = node.icon;
                        return (
                          <div
                            key={node.type}
                            className={`group flex my-2 items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 ${
                              disabled
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 cursor-grab active:cursor-grabbing hover:shadow-sm"
                            }`}
                            draggable={!disabled}
                            onDragStart={
                              disabled
                                ? undefined
                                : (e) => onDragStart(e, node.type)
                            }
                          >
                            <div
                              className={`h-6 w-6 rounded-md ${node.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}
                            >
                              <IconComponent className="h-3 w-3 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-xs flex-1">
                              {node.label}
                            </span>
                            <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 opacity-0 group-hover:opacity-100" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {Object.values(nodeCategories).reduce(
                (total, category) => total + category.nodes.length,
                0
              )}{" "}
              components available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
