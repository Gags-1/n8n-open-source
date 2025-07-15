"use client";

import { useEffect, useState } from "react";
import { Node, Edge } from "@xyflow/react";

interface SharedWorkflowHandlerProps {
  onWorkflowLoad: (nodes: Node[], edges: Edge[]) => void;
  onSharedStateChange: (isShared: boolean, permission: "view" | "edit") => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string | null) => void;
}

export function SharedWorkflowHandler({
  onWorkflowLoad,
  onSharedStateChange,
  onLoadingChange,
  onErrorChange,
}: SharedWorkflowHandlerProps) {
  const [isSharedWorkflow, setIsSharedWorkflow] = useState(false);
  const [sharedPermission, setSharedPermission] = useState<"view" | "edit">("view");

  // Check if this is a shared workflow on component mount
  useEffect(() => {
    const checkForSharedWorkflow = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const shared = urlParams.get('shared');
        const permission = urlParams.get('permission') as "view" | "edit" || "view";
        
        console.log('SharedWorkflowHandler - URL params:', { shared, permission });
        console.log('SharedWorkflowHandler - Current URL:', window.location.href);
        console.log('SharedWorkflowHandler - Search params:', window.location.search);
        
        if (shared && shared.trim()) {
          console.log('SharedWorkflowHandler - Detected shared workflow, setting up...');
          const isShared = true;
          setIsSharedWorkflow(isShared);
          setSharedPermission(permission);
          
          // Notify parent component about shared state
          onSharedStateChange(isShared, permission);
          
          // Load the shared workflow data
          loadSharedWorkflow(shared.trim());
        } else {
          console.log('SharedWorkflowHandler - Not a shared workflow');
          const isShared = false;
          setIsSharedWorkflow(isShared);
          onSharedStateChange(isShared, permission);
        }
      }
    };

    // Check immediately
    checkForSharedWorkflow();

    // Also check on URL changes (in case of navigation)
    const handlePopState = () => {
      checkForSharedWorkflow();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // FIXED: Remove onSharedStateChange from dependencies to prevent infinite loop

  // Load shared workflow data
  const loadSharedWorkflow = async (workflowId: string) => {
    console.log('SharedWorkflowHandler - Loading shared workflow:', workflowId);
    onLoadingChange(true);
    onErrorChange(null);
    
    try {
      const apiUrl = `/api/workflows/${workflowId}?shared=true`;
      console.log('SharedWorkflowHandler - Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('SharedWorkflowHandler - API response status:', response.status);
      console.log('SharedWorkflowHandler - API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('SharedWorkflowHandler - API response data:', data);
        
        if (data && data.workflow) {
          const workflow = data.workflow;
          
          // Handle nodes and edges, defaulting to empty arrays if not present
          const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
          const edges = Array.isArray(workflow.edges) ? workflow.edges : [];
          
          console.log('SharedWorkflowHandler - Processing workflow data:', { 
            workflowId: workflow.id,
            nodesCount: nodes.length, 
            edgesCount: edges.length,
            nodes,
            edges 
          });
          
          // Notify parent component with loaded data
          onWorkflowLoad(nodes, edges);
          
          console.log('SharedWorkflowHandler - Successfully loaded shared workflow');
        } else {
          console.log('SharedWorkflowHandler - No workflow data found in response:', data);
          onErrorChange('Workflow data not found');
        }
      } else {
        const errorText = await response.text();
        console.error('SharedWorkflowHandler - API error:', response.status, response.statusText, errorText);
        
        if (response.status === 404) {
          onErrorChange('Workflow not found');
        } else if (response.status === 401) {
          onErrorChange('Access denied');
        } else {
          onErrorChange(`Failed to load workflow (${response.status})`);
        }
      }
    } catch (error) {
      console.error('SharedWorkflowHandler - Error loading shared workflow:', error);
      onErrorChange('Network error occurred');
    } finally {
      onLoadingChange(false);
    }
  };

  // This component doesn't render anything - it's just for handling shared workflow logic
  return null;
}
