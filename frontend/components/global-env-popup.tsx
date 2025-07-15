"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X, Plus, Trash2, Save, Globe, Edit2, Check, Copy } from "lucide-react";

export interface GlobalEnvironment {
  id: string;
  name: string;
  variables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface GlobalEnvPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalEnvPopup({ isOpen, onClose }: GlobalEnvPopupProps) {
  const [environments, setEnvironments] = useState<GlobalEnvironment[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingEnvId, setEditingEnvId] = useState<string>("");
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvVariables, setNewEnvVariables] = useState("");
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadEnvironments();
    }
  }, [isOpen]);

  const loadEnvironments = () => {
    try {
      const saved = localStorage.getItem("aiflow_global_environments");
      if (saved) {
        const envs = JSON.parse(saved);
        setEnvironments(envs);
        if (envs.length > 0 && !selectedEnvId) {
          setSelectedEnvId(envs[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading environments:", error);
    }
  };

  const saveEnvironments = (envs: GlobalEnvironment[]) => {
    try {
      localStorage.setItem("aiflow_global_environments", JSON.stringify(envs));
      setEnvironments(envs);
    } catch (error) {
      console.error("Error saving environments:", error);
      alert("Failed to save environments. Please try again.");
    }
  };

  const createEnvironment = () => {
    if (!newEnvName.trim()) {
      alert("Please enter a name for the environment");
      return;
    }

    try {
      const variables: Record<string, string> = {};
      if (newEnvVariables.trim()) {
        const lines = newEnvVariables.split("\n");
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.includes("=")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            variables[key.trim()] = valueParts.join("=").trim();
          }
        }
      }

      const newEnv: GlobalEnvironment = {
        id: `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newEnvName.trim(),
        variables,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedEnvs = [...environments, newEnv];
      saveEnvironments(updatedEnvs);
      setSelectedEnvId(newEnv.id);
      setIsCreating(false);
      setNewEnvName("");
      setNewEnvVariables("");
    } catch (error) {
      console.error("Error creating environment:", error);
      alert("Failed to create environment. Please try again.");
    }
  };

  const deleteEnvironment = (envId: string) => {
    if (confirm("Are you sure you want to delete this environment?")) {
      const updatedEnvs = environments.filter((env) => env.id !== envId);
      saveEnvironments(updatedEnvs);
      if (selectedEnvId === envId) {
        setSelectedEnvId(updatedEnvs.length > 0 ? updatedEnvs[0].id : "");
      }
    }
  };

  const startEditing = (envId: string) => {
    const env = environments.find((e) => e.id === envId);
    if (env) {
      setEditingEnvId(envId);
      setEditingName(env.name);
    }
  };

  const saveEnvironmentName = (envId: string) => {
    if (!editingName.trim()) {
      setEditingEnvId("");
      return;
    }

    const updatedEnvs = environments.map((env) =>
      env.id === envId
        ? { ...env, name: editingName.trim(), updatedAt: new Date().toISOString() }
        : env
    );
    saveEnvironments(updatedEnvs);
    setEditingEnvId("");
    setEditingName("");
  };

  const selectedEnv = environments.find((env) => env.id === selectedEnvId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <Card className="w-full max-w-6xl max-h-[85vh] bg-white dark:bg-gray-950 border-0 shadow-2xl">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                  Global Environments
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage environment variables across your workflows
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-5 min-h-[500px]">
            {/* Left Panel - Environment List */}
            <div className="col-span-2 border-r border-gray-100 dark:border-gray-800 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    Environments
                  </h3>
                  <Button
                    onClick={() => setIsCreating(true)}
                    size="sm"
                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    New
                  </Button>
                </div>

                {isCreating && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Environment Name
                        </Label>
                        <Input
                          value={newEnvName}
                          onChange={(e) => setNewEnvName(e.target.value)}
                          placeholder="e.g., Production, Development"
                          className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Variables
                        </Label>
                        <Textarea
                          value={newEnvVariables}
                          onChange={(e) => setNewEnvVariables(e.target.value)}
                          placeholder="OPENAI_API_KEY=sk-...&#10;DATABASE_URL=postgresql://..."
                          className="min-h-[100px] font-mono text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          rows={4}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          One variable per line in KEY=value format
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={createEnvironment}
                          size="sm"
                          className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          <Save className="h-3 w-3 mr-1.5" />
                          Create
                        </Button>
                        <Button
                          onClick={() => {
                            setIsCreating(false);
                            setNewEnvName("");
                            setNewEnvVariables("");
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {environments.map((env) => (
                    <div
                      key={env.id}
                      className={`group rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                        selectedEnvId === env.id
                          ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                      }`}
                      onClick={() => setSelectedEnvId(env.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {editingEnvId === env.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-7 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    saveEnvironmentName(env.id);
                                  } else if (e.key === "Escape") {
                                    setEditingEnvId("");
                                    setEditingName("");
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEnvironmentName(env.id);
                                }}
                                className="h-7 w-7 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {env.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {Object.keys(env.variables).length} variables
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(env.id);
                            }}
                            className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEnvironment(env.id);
                            }}
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {environments.length === 0 && !isCreating && (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <Globe className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      No environments yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Create your first environment to get started
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Environment Details */}
            <div className="col-span-3 p-6">
              {selectedEnv ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {selectedEnv.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {Object.keys(selectedEnv.variables).length} environment variables
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.keys(selectedEnv.variables).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(selectedEnv.variables).map(([key, value]) => (
                          <div
                            key={key}
                            className="group bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Label className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">
                                    {key}
                                  </Label>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                                    {value.length > 60 ? `${value.substring(0, 60)}...` : value}
                                  </code>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(value);
                                }}
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                          <Globe className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          No variables defined
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Edit this environment to add variables
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Select an Environment
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose an environment from the list to view and manage its variables
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Utility function to get all global environments
export function getGlobalEnvironments(): GlobalEnvironment[] {
  try {
    const saved = localStorage.getItem("aiflow_global_environments");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading global environments:", error);
    return [];
  }
}

// Utility function to get environment variables by ID
export function getEnvironmentVariables(envId: string): Record<string, string> {
  const environments = getGlobalEnvironments();
  const env = environments.find((e) => e.id === envId);
  return env ? env.variables : {};
}
