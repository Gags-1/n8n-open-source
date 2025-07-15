"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GlobalEnvPopup } from "@/components/global-env-popup";
import {
  Plus,
  Workflow,
  Clock,
  Trash2,
  Zap,
  ArrowRight,
  Edit2,
  Check,
  X,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useWorkflowServiceAPI, WorkflowData } from "@/lib/workflow-service";
import { useAuth } from "@clerk/nextjs";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const workflowService = useWorkflowServiceAPI();

  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFlow, setEditingFlow] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showGlobalEnvPopup, setShowGlobalEnvPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && userId) {
      loadWorkflows();
    } else if (isLoaded && !userId) {
      setIsLoading(false);
    }
  }, [isLoaded, userId]);

  const loadWorkflows = async () => {
    try {
      setError(null);
      const data = await workflowService.getAllWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error("Error loading workflows:", error);
      setError("Failed to load workflows. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewFlow = async () => {
    try {
      setError(null);
      const newWorkflow = await workflowService.createWorkflow({
        name: "Untitled Flow",
        description: "New AI workflow",
        nodes: [],
        edges: [],
      });

      // Navigate to the new flow
      router.push(`/dashboard/flow/${newWorkflow.id}`);
    } catch (error) {
      console.error("Error creating flow:", error);
      setError("Failed to create new flow. Please try again.");
    }
  };

  const deleteFlow = async (flowId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (confirm("Are you sure you want to delete this flow?")) {
      try {
        setError(null);
        await workflowService.deleteWorkflow(flowId);
        setWorkflows(workflows.filter((w) => w.id !== flowId));
      } catch (error) {
        console.error("Error deleting flow:", error);
        setError("Failed to delete flow. Please try again.");
      }
    }
  };

  const startEditing = (flow: WorkflowData, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEditingFlow(flow.id);
    setEditingName(flow.name);
  };

  const cancelEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEditingFlow(null);
    setEditingName("");
  };

  const saveFlowName = async (flowId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (editingName.trim()) {
      try {
        setError(null);
        const updatedWorkflow = await workflowService.updateWorkflow(flowId, {
          name: editingName.trim(),
        });

        setWorkflows(
          workflows.map((w) => (w.id === flowId ? updatedWorkflow : w))
        );
      } catch (error) {
        console.error("Error updating flow name:", error);
        setError("Failed to update flow name. Please try again.");
      }
    }

    setEditingFlow(null);
    setEditingName("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    }).format(date);
  };

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100 mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading your workflows...
          </p>
        </div>
      </div>
    );
  }

  // Show auth required state
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Workflow className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please sign in to access your workflows.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white dark:text-gray-900" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AIFlow
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowGlobalEnvPopup(true)}
                variant="outline"
                size="sm"
                className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>

              <Button
                onClick={createNewFlow}
                size={"sm"}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Workflow
              </Button>

              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {workflows.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
              <Workflow className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Start building workflows
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Create your first AI workflow to automate tasks and connect
              different services together.
            </p>
            <Button
              onClick={createNewFlow}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workflow
            </Button>
          </div>
        ) : (
          <div>
            {/* Stats Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Workflows
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {workflows.length} workflow
                    {workflows.length !== 1 ? "s" : ""} in your workspace
                  </p>
                </div>
              </div>
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((flow) => (
                <Link key={flow.id} href={`/dashboard/flow/${flow.id}`}>
                  <Card className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {editingFlow === flow.id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="text-base font-medium bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    saveFlowName(flow.id, e as any);
                                  } else if (e.key === "Escape") {
                                    cancelEditing(e as any);
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => saveFlowName(flow.id, e)}
                                className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditing}
                                className="h-8 w-8 p-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          ) : (
                            <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100 truncate pr-8">
                              {flow.name}
                            </CardTitle>
                          )}

                          {flow.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                              {flow.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => startEditing(flow, e)}
                            className="h-8 w-8 p-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteFlow(flow.id, e)}
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span>{flow.nodes?.length || 0} nodes</span>
                          <span>{flow.edges?.length || 0} connections</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(flow.updated_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                          <span>Open workflow</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      
    </div>
  );
}
