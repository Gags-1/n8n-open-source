"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Workflow } from "lucide-react";
import { useWorkflowServiceAPI, WorkflowData } from "@/lib/workflow-service";
import { useAuth } from "@clerk/nextjs";

export default function FlowPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const workflowService = useWorkflowServiceAPI(); // Changed to use API service
  
  const flowId = params.id as string;
  const [flowData, setFlowData] = useState<WorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && userId && flowId) {
      loadFlowData();
    } else if (isLoaded && !userId) {
      setIsLoading(false);
    }
  }, [isLoaded, userId, flowId]);

  const loadFlowData = async () => {
    try {
      setError(null);
      const data = await workflowService.getWorkflowById(flowId);
      
      if (!data) {
        // Create new workflow if it doesn't exist
        const newWorkflow = await workflowService.createWorkflow({
          name: `Flow ${flowId.slice(0, 8)}`,
          description: "New AI workflow",
          nodes: [],
          edges: [],
        });
        setFlowData(newWorkflow);
      } else {
        setFlowData(data);
      }
    } catch (error) {
      console.error("Error loading flow data:", error);
      setError("Failed to load workflow. Please try again.");
      
      // Create fallback flow for better UX
      setFlowData({
        id: flowId,
        user_id: userId!,
        name: `Flow ${flowId.slice(0, 8)}`,
        description: "New AI workflow",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        nodes: [],
        edges: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlow = async (nodes: any[], edges: any[]) => {
    if (!flowData) return;

    try {
      setError(null);
      const updatedFlow = await workflowService.updateWorkflow(flowData.id, {
        nodes,
        edges,
      });
      setFlowData(updatedFlow);
    } catch (error) {
      console.error("Error saving flow:", error);
      setError("Failed to save workflow. Please try again.");
    }
  };

  const handleNavigateBack = () => {
    router.push("/dashboard");
  };

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100 mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  // Show auth required state
  if (!userId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Workflow className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Please sign in to access this workflow.
            </p>
            <Button 
              onClick={handleNavigateBack} 
              variant="outline"
              className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !flowData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <Workflow className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Error Loading Workflow
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={handleNavigateBack} 
              variant="outline"
              className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show workflow not found state
  if (!flowData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Workflow className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Workflow Not Found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              The requested workflow could not be found.
            </p>
            <Button 
              onClick={handleNavigateBack} 
              variant="outline"
              className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      {/* Error Display */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 shadow-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <Dashboard 
        flowId={flowId}
        initialNodes={flowData.nodes}
        initialEdges={flowData.edges}
        onSave={handleSaveFlow}
        flowName={flowData.name}
        flowDescription={flowData.description}
        onNavigateBack={handleNavigateBack}
      />
    </div>
  );
}