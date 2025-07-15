"use client";

import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type Node,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Layers,
  FileInput,
  FileOutput,
  Bot,
  Sparkles,
  Brain,
  Mail,
  FileText,
  Webhook,
  Activity,
  FileType2,
  MessageCircle,
  Clapperboard,
  Pilcrow,
} from "lucide-react";

// Import the reusable node components
import { OpenAINode } from "./nodes/openai-node";
import { OpenAIAdvancedNode } from "./nodes/openai-advanced-node";
import { GeminiNode } from "./nodes/gemini-node";
import { GeminiAdvancedNode } from "./nodes/gemini-advanced-node";
import { EmailNode } from "./nodes/email-node";
import { HashnodeNode } from "./nodes/hashnode-node";
import { ClaudeNode } from "./nodes/claude-node";
import { WebhookNode } from "./nodes/webhook-node";
import { InputNode } from "./nodes/input-node";
import { OutputNode } from "./nodes/output-node";
import { ContextNode } from "./nodes/context-node";
import { PromptNode } from "./nodes/prompt-node";
import { MongoDBNode } from "./nodes/mongodb-node";
import { TextNode } from "./nodes/text-node";
import { PdfNode } from "./nodes/pdf-node";
import { WhatsAppNode } from "./nodes/whatsapp-node";
import { VideoSummaryNode } from "./nodes/video-summary-node";
import { TextEditorNode } from "./nodes/text-editor-node";
import { Sidebar } from "./sidebar";

// Import API functions
import { type QueryRequest } from "@/app/api/query/route";

// Import shared workflow components
import { SharedWorkflowHandler } from "./shared-workflow-handler";
import { SharedWorkflowUI } from "./shared-workflow-ui";
import { ShareModal } from "./modals/share-modal";
import { ExecutionResultModal } from "./modals/execution-result-modal";
import { ExecutionProgressIndicator } from "./ui/execution-progress-indicator";
import { StatusBar } from "./ui/status-bar";
import { FlowHeader } from "./ui/flow-header";
import { Toolbar } from "./ui/toolbar";

// Register custom node types
const nodeTypes = {
  workflowInput: InputNode,
  context: ContextNode,
  prompt: PromptNode,
  workflowOutput: OutputNode,
  openai: OpenAINode,
  "openai-advanced": OpenAIAdvancedNode,
  gemini: GeminiNode,
  "gemini-advanced": GeminiAdvancedNode,
  email: EmailNode,
  hashnode: HashnodeNode,
  claude: ClaudeNode,
  webhook: WebhookNode,
  mongodb: MongoDBNode,
  text: TextNode,
  pdf: PdfNode,
  whatsapp: WhatsAppNode,
  "video-summary": VideoSummaryNode,
  "text-editor": TextEditorNode,
};

interface DashboardProps {
  flowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  flowName?: string;
  flowDescription?: string;
  onNavigateBack?: () => void;
}

export default function Dashboard({
  flowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  flowName,
  flowDescription,
  onNavigateBack,
}: DashboardProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>("");
  // Add execution state tracking
  const [currentExecutingNode, setCurrentExecutingNode] = useState<
    string | null
  >(null);
  const [executionProgress, setExecutionProgress] = useState<{
    completed: string[];
    current: string | null;
    total: number;
  }>({
    completed: [],
    current: null,
    total: 0,
  });

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePermission, setSharePermission] = useState<"view" | "edit">("view");
  const [shareLink, setShareLink] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Shared workflow state - managed by SharedWorkflowHandler
  const [isSharedWorkflow, setIsSharedWorkflow] = useState(false);
  const [sharedPermission, setSharedPermission] = useState<"view" | "edit">("view");
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState<string | null>(null);

  // Shared workflow handlers - wrapped in useCallback to prevent infinite loops
  const handleSharedWorkflowLoad = useCallback((nodes: Node[], edges: Edge[]) => {
    setNodes(nodes);
    setEdges(edges);
    setHasInitialized(true);
  }, [setNodes, setEdges]);

  const handleSharedStateChange = useCallback((isShared: boolean, permission: "view" | "edit") => {
    setIsSharedWorkflow(isShared);
    setSharedPermission(permission);
  }, []);

  const handleSharedLoadingChange = useCallback((loading: boolean) => {
    setSharedLoading(loading);
  }, []);

  const handleSharedErrorChange = useCallback((error: string | null) => {
    setSharedError(error);
  }, []);

  // Share functionality
  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    const shareId = flowId || `temp-${Date.now()}`;
    const permission = sharePermission;
    
    // Generate a shareable URL with permission parameter
    const shareUrl = `${baseUrl}${currentPath}?shared=${shareId}&permission=${permission}`;
    setShareLink(shareUrl);
  };

  const handleShareClick = () => {
    generateShareLink();
    setShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handlePermissionChange = (permission: "view" | "edit") => {
    setSharePermission(permission);
    generateShareLink();
  };

  // Auto-save functionality - FIXED to prevent infinite loops
  useEffect(() => {
    if (flowId && onSave && (nodes.length > 0 || edges.length > 0)) {
      const saveTimer = setTimeout(() => {
        onSave(nodes, edges);
        setLastSaved(new Date().toLocaleTimeString());
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [nodes, edges, flowId]); // REMOVED onSave from dependencies

  // Load initial data when props change - FIXED to prevent loops
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Don't initialize with props if this is a shared workflow (we load it separately)
    if (isSharedWorkflow) {
      return;
    }
    
    // Only initialize once when component mounts or flowId changes
    if (
      !hasInitialized &&
      (initialNodes.length > 0 || initialEdges.length > 0)
    ) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setHasInitialized(true);
    }
  }, [initialNodes, initialEdges, hasInitialized, setNodes, setEdges, isSharedWorkflow]);

  // Reset initialization flag when flowId changes
  useEffect(() => {
    setHasInitialized(false);
  }, [flowId]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
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
          type: "workflowOutput",
          label: "Output",
          icon: FileOutput,
          color: "bg-emerald-500",
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
        { type: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-600" },
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
        {
          type: "text-editor",
          label: "Sticky Note",
          icon: Pilcrow,
          color: "bg-gray-500",
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

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Prevent adding nodes if this is a shared workflow with view-only permission
      if (isSharedWorkflow && sharedPermission === "view") {
        return;
      }

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Handle regular ReactFlow nodes (including text-editor)
      const nodeId = `${type}-${Date.now()}`;
      const newNode = {
        id: nodeId,
        type,
        position,
        data: getDefaultNodeDataWithId(type, nodeId),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, isSharedWorkflow, sharedPermission]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const getDefaultNodeData = (type: string) => {
    const nodeId = `${type}-${Date.now()}`;

    switch (type) {
      case "workflowInput":
        return {
          value: "",
          placeholder: "Enter your query here...",
          label: "User Input",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      case "workflowOutput":
        return {
          displayType: "text",
          label: "Workflow Output",
          result: "",
          timestamp: "",
        };
      case "openai":
        return {
          apiKey: "",
          model: "gpt-4.1-mini",
          temperature: 0.7,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "openai-advanced":
        return {
          apiKey: "",
          model: "gpt-4-turbo-preview",
          temperature: 0.7,
          maxTokens: 1024,
          userPrompt: "",
          input: "", // Backward compatibility
          context: "",
          systemInstruction: "You are a helpful AI assistant.",
          prompt: "You are a helpful AI assistant.", // Backward compatibility
          jsonMode: false,
          stream: false,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "gemini":
        return {
          apiKey: "",
          model: "gemini-2.5-flash",
          maxTokens: 2048,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "gemini-advanced":
        return {
          apiKey: "",
          model: "gemini-1.5-flash",
          temperature: 0.7,
          maxOutputTokens: 2048,
          userPrompt: "",
          context: "",
          systemInstruction: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "email":
        return {
          fromEmail: "",
          toEmail: "",
          username: "",
          password: "",
          useAiSubject: true,
          aiSubjectPrompt:
            "Generate a professional email subject based on the content",
          smtpServer: "smtp.gmail.com",
          smtpPort: 587,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "hashnode":
        return {
          apiKey: "",
          publicationId: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "webhook":
        return {
          webhookUrl: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "context":
        return {
          value: "",
          label: "Context Information",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      case "prompt":
        return {
          value: "",
          label: "System Prompt",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      case "claude":
        return {
          apiKey: "",
          model: "claude-3-sonnet-20240229",
          maxTokens: 10000,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "mongodb":
        return {
          mongoUri: "",
          collection: "",
          operation: "find",
          query: "",
          vectorField: "",
          limit: 10,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "text":
        return {
          filename: "workflow_output.txt",
          savePath: "/tmp",
          format: "txt",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "pdf":
        return {
          filename: "output.pdf",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "whatsapp":
        return {
          twilio_sid: "",
          twilio_token: "",
          to_number: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "video-summary":
        return {
          apiKey: "",
          language: "en",
          model: "gpt-3.5-turbo",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "text-editor":
        return {
          value: "",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      default:
        return {};
    }
  };

  const getDefaultNodeDataWithId = (type: string, nodeId: string) => {
    switch (type) {
      case "workflowInput":
        return {
          value: "",
          placeholder: "Enter your query here...",
          label: "User Input",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      case "workflowOutput":
        return {
          displayType: "text",
          label: "Workflow Output",
          result: "",
          timestamp: "",
        };
      case "openai":
        return {
          apiKey: "",
          model: "gpt-4",
          temperature: 0.7,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "openai-advanced":
        return {
          apiKey: "",
          model: "gpt-4-turbo-preview",
          temperature: 0.7,
          maxTokens: 1024,
          userPrompt: "",
          input: "", // Backward compatibility
          context: "",
          systemInstruction: "You are a helpful AI assistant.",
          prompt: "You are a helpful AI assistant.", // Backward compatibility
          jsonMode: false,
          stream: false,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "gemini":
        return {
          apiKey: "",
          model: "gemini-pro",
          maxTokens: 2048,
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "gemini-advanced":
        return {
          apiKey: "",
          model: "gemini-1.5-flash",
          temperature: 0.7,
          maxOutputTokens: 2048,
          userPrompt: "",
          context: "",
          systemInstruction: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "email":
        return {
          fromEmail: "",
          toEmail: "",
          username: "",
          password: "",
          subject: "Workflow Output",
          smtpServer: "smtp.gmail.com",
          smtpPort: 587,
          useAiSubject: true,
          aiSubjectPrompt:
            "Generate a professional email subject based on the content",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "hashnode":
        return {
          apiKey: "",
          publicationId: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "webhook":
        return {
          webhookUrl: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "context":
        return {
          value: "",
          label: "Context Information",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      case "prompt":
        return {
          value: "",
          label: "System Prompt",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      case "pdf":
        return {
          filename: "output.pdf",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "whatsapp":
        return {
          twilio_sid: "",
          twilio_token: "",
          to_number: "",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "video-summary":
        return {
          apiKey: "",
          language: "en",
          model: "gpt-3.5-turbo",
          onChange: (field: string, value: any) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, [field]: value } }
                  : node
              )
            );
          },
        };
      case "text-editor":
        return {
          value: "",
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, value } }
                  : node
              )
            );
          },
        };
      default:
        return {};
    }
  };

  const getNodeOrder = () => {
    // Get all nodes that should be executed (excluding UI-only nodes)
    const executableNodes = nodes.filter(
      (node) =>
        node.type !== "workflowInput" &&
        node.type !== "workflowOutput" &&
        node.type !== "context" &&
        node.type !== "prompt" &&
        node.type !== "text-editor"
    );

    // If no executable nodes, return empty array
    if (executableNodes.length === 0) return [];

    // Find nodes that are connected to the workflow (have input or are connected to input)
    const connectedNodeIds = new Set<string>();
    
    // Find input nodes to start the search
    const inputNodes = nodes.filter(node => 
      node.type === "workflowInput" || 
      node.type === "context" || 
      node.type === "prompt"
    );
    
    // BFS to find all nodes connected from inputs
    const queue = [...inputNodes.map(n => n.id)];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      if (visited.has(currentNodeId)) continue;
      visited.add(currentNodeId);
      
      // If it's an executable node, mark it as connected
      if (executableNodes.some(n => n.id === currentNodeId)) {
        connectedNodeIds.add(currentNodeId);
      }
      
      // Find all nodes connected from this one
      edges
        .filter(edge => edge.source === currentNodeId)
        .forEach(edge => {
          if (!visited.has(edge.target)) {
            queue.push(edge.target);
          }
        });
    }
    
    // Also check for nodes that are directly connected to each other (in case of isolated subgraphs)
    const findConnectedComponents = () => {
      const allConnectedNodes = new Set<string>();
      
      executableNodes.forEach(node => {
        if (connectedNodeIds.has(node.id)) {
          // This node is already connected to the main workflow
          allConnectedNodes.add(node.id);
        } else {
          // Check if this node is connected to any other executable node
          const hasConnections = edges.some(edge => 
            (edge.source === node.id && executableNodes.some(n => n.id === edge.target)) ||
            (edge.target === node.id && executableNodes.some(n => n.id === edge.source))
          );
          
          // Only include nodes that have connections to other executable nodes
          if (hasConnections) {
            allConnectedNodes.add(node.id);
          }
        }
      });
      
      return Array.from(allConnectedNodes);
    };
    
    // Get only the connected executable nodes
    const connectedExecutableNodeIds = findConnectedComponents();
    const connectedExecutableNodes = executableNodes.filter(node => 
      connectedExecutableNodeIds.includes(node.id)
    );

    // If no connected executable nodes, return empty array (don't execute isolated nodes)
    if (connectedExecutableNodes.length === 0) return [];

    // Simple topological sort based on connections (only for connected nodes)
    const visitedSort = new Set<string>();
    const result: string[] = [];
    const inDegree = new Map<string, number>();

    // Initialize in-degree count for connected nodes only
    connectedExecutableNodes.forEach((node) => {
      inDegree.set(node.id, 0);
    });

    // Calculate in-degrees (only between connected executable nodes)
    edges.forEach((edge) => {
      // Only count edges between connected executable nodes
      const sourceNode = connectedExecutableNodes.find((n) => n.id === edge.source);
      const targetNode = connectedExecutableNodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode && inDegree.has(edge.target)) {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    });

    // Find nodes with no incoming edges (starting points) among connected nodes
    const queueSort: string[] = [];
    connectedExecutableNodes.forEach((node) => {
      if (inDegree.get(node.id) === 0) {
        queueSort.push(node.id);
      }
    });

    // If no starting points found, use the first connected executable node
    if (queueSort.length === 0 && connectedExecutableNodes.length > 0) {
      queueSort.push(connectedExecutableNodes[0].id);
    }

    // Process nodes in topological order
    while (queueSort.length > 0) {
      const nodeId = queueSort.shift()!;
      if (!visitedSort.has(nodeId)) {
        visitedSort.add(nodeId);
        result.push(nodeId);

        // Find outgoing edges and reduce in-degree of target nodes (only connected executable ones)
        edges
          .filter((edge) => edge.source === nodeId)
          .forEach((edge) => {
            const targetNode = connectedExecutableNodes.find((n) => n.id === edge.target);
            if (targetNode && inDegree.has(edge.target)) {
              const newInDegree = (inDegree.get(edge.target) || 0) - 1;
              inDegree.set(edge.target, newInDegree);
              if (newInDegree === 0) {
                queueSort.push(edge.target);
              }
            }
          });
      }
    }

    // Add any remaining unvisited connected executable nodes
    connectedExecutableNodes.forEach((node) => {
      if (!visitedSort.has(node.id)) {
        result.push(node.id);
      }
    });

    return result;
  };

  // Map frontend node types to backend node IDs
  const mapNodeTypeToBackendId = (frontendNodeType: string): string => {
    const nodeTypeMapping: Record<string, string> = {
      "openai": "openai",
      "openai-advanced": "openai/advanced",
      "gemini": "gemini",
      "gemini-advanced": "gemini/advanced",
      "claude": "claude",
      "email": "email",
      "hashnode": "hashnode",
      "webhook": "webhook",
      "mongodb": "mongodb",
      "text": "text",
      "pdf": "pdf",
      "whatsapp": "whatsapp",
      "video-summary": "video_summary",
    };

    return nodeTypeMapping[frontendNodeType] || frontendNodeType;
  };

  const extractApiKeysFromNodes = () => {
    const apiKeys: Record<string, any> = {};
    const nodeInstances: Record<string, number> = {};

    nodes.forEach((node) => {
      const nodeData = node.data;
      const nodeType = node.type;

      // Skip if nodeType is undefined
      if (!nodeType) return;

      // Track multiple instances of the same node type
      if (!nodeInstances[nodeType]) {
        nodeInstances[nodeType] = 0;
      }
      nodeInstances[nodeType]++;

      const instanceSuffix =
        nodeInstances[nodeType] > 1 ? `_${nodeInstances[nodeType]}` : "";

      switch (nodeType) {
        case "openai":
          // Always set up the parameters, even if API key is empty (user might set it later)
          apiKeys[`openai`] = nodeData.apiKey || "";
          // Also store model and temperature for each instance
          apiKeys[`openai${instanceSuffix}_model`] =
            nodeData.model || "gpt-4o-mini";
          apiKeys[`openai${instanceSuffix}_temperature`] =
            nodeData.temperature || 0.7;
          break;
        case "openai-advanced":
          // Always set up the parameters, even if API key is empty (user might set it later)
          apiKeys[`openai`] = nodeData.apiKey || "";
          apiKeys[`openai${instanceSuffix}_model`] =
            nodeData.model || "gpt-4-turbo-preview";
          apiKeys[`openai${instanceSuffix}_temperature`] =
            nodeData.temperature || 0.7;
          apiKeys[`openai${instanceSuffix}_max_tokens`] =
            nodeData.maxTokens || 1024;
          apiKeys[`openai${instanceSuffix}_json_mode`] =
            nodeData.jsonMode || false;
          apiKeys[`openai${instanceSuffix}_stream`] = nodeData.stream || false;
          if (nodeData.systemInstruction || nodeData.systemMessage) {
            apiKeys[`openai${instanceSuffix}_system_message`] =
              nodeData.systemInstruction || nodeData.systemMessage;
          }
          break;
        case "gemini":
          if (nodeData.apiKey) {
            apiKeys[`gemini`] = nodeData.apiKey;
            apiKeys[`gemini${instanceSuffix}_model`] =
              nodeData.model || "gemini-2.0-flash-exp";
            apiKeys[`gemini${instanceSuffix}_temperature`] =
              nodeData.temperature || 0.7;
          }
          break;
        case "gemini-advanced":
          if (nodeData.apiKey) {
            apiKeys[`gemini`] = nodeData.apiKey;
            apiKeys[`gemini${instanceSuffix}_model`] =
              nodeData.model || "gemini-2.5-flash";
            apiKeys[`gemini${instanceSuffix}_temperature`] =
              nodeData.temperature || 0.7;
            apiKeys[`gemini${instanceSuffix}_max_output_tokens`] =
              nodeData.maxOutputTokens || 2048;
            if (nodeData.systemInstruction) {
              apiKeys[`gemini${instanceSuffix}_system_instruction`] =
                nodeData.systemInstruction;
            }
          }
          break;
        case "claude":
          if (nodeData.apiKey) {
            apiKeys[`anthropic`] = nodeData.apiKey;
            apiKeys[`claude${instanceSuffix}_model`] =
              nodeData.model || "claude-3-sonnet-20240229";
            apiKeys[`claude${instanceSuffix}_max_tokens`] =
              nodeData.maxTokens || 1024;
          }
          break;
        case "email":
          if (nodeData.fromEmail || nodeData.toEmail) {
            apiKeys[`email_config`] = {
              from_email: nodeData.fromEmail || "",
              to_email: nodeData.toEmail || "",
              smtp_server: nodeData.smtpServer || "smtp.gmail.com",
              smtp_port: nodeData.smtpPort || 587,
              username: nodeData.username || "",
              password: nodeData.password || "",
              subject: nodeData.subject || "Workflow Output",
            };
          }
          break;
        case "hashnode":
          if (nodeData.apiKey) {
            apiKeys[`hashnode_token`] = nodeData.apiKey;
            apiKeys[`hashnode_publication_id${instanceSuffix}`] =
              nodeData.publicationId || "";
          }
          break;
        case "webhook":
          if (nodeData.webhookUrl) {
            apiKeys[`webhook_url`] = nodeData.webhookUrl;
          }
          break;
        case "mongodb":
          if (nodeData.mongoUri) {
            apiKeys[`mongodb_uri`] = nodeData.mongoUri;
            apiKeys[`mongodb${instanceSuffix}_collection`] =
              nodeData.collection || "";
            apiKeys[`mongodb${instanceSuffix}_operation`] =
              nodeData.operation || "find";
            apiKeys[`mongodb${instanceSuffix}_query`] = nodeData.query || "";
            apiKeys[`mongodb${instanceSuffix}_vector_field`] =
              nodeData.vectorField || "";
            apiKeys[`mongodb${instanceSuffix}_limit`] = nodeData.limit || 10;
          }
          break;
        case "text":
          apiKeys[`text${instanceSuffix}_filename`] =
            nodeData.filename || "workflow_output.txt";
          apiKeys[`text${instanceSuffix}_save_path`] =
            nodeData.savePath || "/tmp";
          apiKeys[`text${instanceSuffix}_format`] = nodeData.format || "txt";
          break;
        case "pdf":
          apiKeys[`pdf${instanceSuffix}_filename`] =
            nodeData.filename || "output.pdf";
          break;
        case "whatsapp":
          if (nodeData.twilio_sid && nodeData.twilio_token) {
            apiKeys[`twilio_sid`] = nodeData.twilio_sid;
            apiKeys[`twilio_token`] = nodeData.twilio_token;
            apiKeys[`whatsapp${instanceSuffix}_to_number`] =
              nodeData.to_number || "";
          }
          break;
        case "video-summary":
          // Video summary doesn't require additional API keys
          // It uses the user query as the YouTube URL
          break;
      }
    });

    return apiKeys;
  };

  const extractUserQueryFromNodes = (): string => {
    const inputNode = nodes.find((node) => node.type === "workflowInput");
    if (inputNode && inputNode.data.value) {
      return String(inputNode.data.value);
    }
    return "";
  };

  const extractNodeParamsFromNodes = (): Record<string, Record<string, any>> => {
    const nodeParams: Record<string, Record<string, any>> = {};
    const nodeTypeCount: Record<string, number> = {};

    nodes.forEach((node) => {
      const nodeData = node.data;
      const nodeType = node.type;

      // Skip if nodeType is undefined or not executable
      if (!nodeType || nodeType === "workflowInput" || nodeType === "workflowOutput" || 
          nodeType === "context" || nodeType === "prompt") return;

      // Map to backend node type
      const backendNodeType = mapNodeTypeToBackendId(nodeType);
      
      // Track instances of each backend node type
      if (!nodeTypeCount[backendNodeType]) {
        nodeTypeCount[backendNodeType] = 0;
      }
      nodeTypeCount[backendNodeType]++;
      
      // Create unique key for multiple instances
      const nodeKey = nodeTypeCount[backendNodeType] > 1 
        ? `${backendNodeType}_${nodeTypeCount[backendNodeType]}`
        : backendNodeType;

      // Extract relevant parameters based on node type
      const params: Record<string, any> = {};

      // Include connected input values in parameters
      if (nodeData.connectedInputs && typeof nodeData.connectedInputs === 'object') {
        const connectedInputs = nodeData.connectedInputs as { 
          input?: string; 
          prompt?: string; 
          context?: string;
          userPrompt?: string;
          systemInstruction?: string;
        };
        if (connectedInputs.input) params.input_value = connectedInputs.input;
        if (connectedInputs.prompt) params.prompt_value = connectedInputs.prompt;
        if (connectedInputs.context) params.context_value = connectedInputs.context;
        if (connectedInputs.userPrompt) params.user_prompt_value = connectedInputs.userPrompt;
        if (connectedInputs.systemInstruction) params.system_instruction_value = connectedInputs.systemInstruction;
      }

      switch (nodeType) {
        case "openai-advanced":
          if (nodeData.apiKey) params.api_key = nodeData.apiKey;
          if (nodeData.model) params.model = nodeData.model;
          if (nodeData.temperature !== undefined) params.temperature = nodeData.temperature;
          if (nodeData.maxTokens) params.max_tokens = nodeData.maxTokens;
          if (nodeData.systemInstruction || nodeData.systemMessage) params.system_instruction = nodeData.systemInstruction || nodeData.systemMessage;
          if (nodeData.userPrompt || nodeData.input) params.user_prompt = nodeData.userPrompt || nodeData.input;
          if (nodeData.context) params.context = nodeData.context;
          if (nodeData.jsonMode !== undefined) params.json_mode = nodeData.jsonMode;
          if (nodeData.stream !== undefined) params.stream = nodeData.stream;
          break;
        case "gemini-advanced":
          if (nodeData.model) params.model = nodeData.model;
          if (nodeData.temperature !== undefined) params.temperature = nodeData.temperature;
          if (nodeData.maxOutputTokens) params.max_output_tokens = nodeData.maxOutputTokens;
          if (nodeData.systemInstruction) params.system_instruction = nodeData.systemInstruction;
          if (nodeData.userPrompt) params.user_prompt = nodeData.userPrompt;
          if (nodeData.context) params.context = nodeData.context;
          break;
        case "whatsapp":
          if (nodeData.to_number) params.to_number = nodeData.to_number;
          break;
        case "pdf":
          if (nodeData.filename) params.filename = nodeData.filename;
          break;
        case "text":
          if (nodeData.filename) params.filename = nodeData.filename;
          if (nodeData.savePath) params.save_path = nodeData.savePath;
          if (nodeData.format) params.format = nodeData.format;
          break;
        case "mongodb":
          if (nodeData.collection) params.collection = nodeData.collection;
          if (nodeData.operation) params.operation = nodeData.operation;
          if (nodeData.query) params.query = nodeData.query;
          if (nodeData.vectorField) params.vector_field = nodeData.vectorField;
          if (nodeData.limit) params.limit = nodeData.limit;
          break;
      }

      // Only add if there are parameters
      if (Object.keys(params).length > 0) {
        nodeParams[nodeKey] = params;
      }
    });

    return nodeParams;
  };

  // Force a re-extraction right before execution with the latest state
  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      alert("Please add some nodes to execute");
      return;
    }

    // Force React to flush any pending state updates
    await new Promise((resolve) => {
      setTimeout(() => {
        setNodes((prevNodes) => {
          resolve(undefined);
          return prevNodes; // Return same nodes, just forcing a flush
        });
      }, 50);
    });

    // Add additional delay to ensure all updates are processed
    await new Promise((resolve) => setTimeout(resolve, 150));

    const userQuery = extractUserQueryFromNodes();

    if (!userQuery.trim()) {
      alert("Please enter a query in the Input node before executing");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    // Clear all previous execution states first
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isExecuting: false,
          executionStatus: undefined,
        },
      }))
    );

    try {
      // Get the execution order
      const nodeOrder = getNodeOrder();

      // Filter to get actual executable nodes with their types
      const executableNodes = nodeOrder
        .map((nodeId) => {
          const node = nodes.find((n) => n.id === nodeId);
          return node ? { id: nodeId, type: node.type } : null;
        })
        .filter(
          (item): item is { id: string; type: string } =>
            item !== null &&
            item.type !== "workflowInput" &&
            item.type !== "workflowOutput"
        );

      if (executableNodes.length === 0) {
        alert("No connected executable nodes found in the workflow. Please connect your nodes to create a workflow path, or add input nodes to start the workflow.");
        return;
      }

      // Initialize execution progress
      setExecutionProgress({
        completed: [],
        current: null,
        total: executableNodes.length,
      });

      // Execute nodes one by one with visual feedback
      for (let i = 0; i < executableNodes.length; i++) {
        const currentNodeData = executableNodes[i];

        // Set current executing node
        setCurrentExecutingNode(currentNodeData.id);
        setExecutionProgress((prev) => ({
          ...prev,
          current: currentNodeData.id,
        }));

        // Update the specific node to show it's executing
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === currentNodeData.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isExecuting: true,
                  executionStatus: "executing",
                },
              };
            }
            return node;
          })
        );

        // Wait to show the execution animation
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Mark node as completed
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === currentNodeData.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isExecuting: false,
                  executionStatus: "completed",
                },
              };
            }
            return node;
          })
        );

        // Update execution progress
        setExecutionProgress((prev) => ({
          completed: [...prev.completed, currentNodeData.id],
          current: null,
          total: prev.total,
        }));

        // Small delay before next node
        if (i < executableNodes.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      // Now execute the actual workflow
      const apiKeys = extractApiKeysFromNodes();
      const nodeParams = extractNodeParamsFromNodes();

      // Map frontend node types to backend node IDs and handle multiple instances
      const nodeTypeCount: Record<string, number> = {};
      const backendNodeIds = executableNodes.map((item) => {
        // Map to backend node ID
        const backendNodeType = mapNodeTypeToBackendId(item.type);
        
        // Track instances
        if (!nodeTypeCount[backendNodeType]) {
          nodeTypeCount[backendNodeType] = 0;
        }
        nodeTypeCount[backendNodeType]++;
        
        // Return unique identifier for multiple instances
        return nodeTypeCount[backendNodeType] > 1 
          ? `${backendNodeType}_${nodeTypeCount[backendNodeType]}`
          : backendNodeType;
      });

      const request: QueryRequest = {
        node_ids: backendNodeIds,
        user_query: userQuery,
        api_keys: apiKeys,
        node_params: nodeParams,
      };

      // Make API call instead of direct function call
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update output node with results
      setNodes((nds) =>
        nds.map((node) =>
          node.type === "workflowOutput"
            ? {
                ...node,
                data: {
                  ...node.data,
                  result: result.result,
                  value: result.result,
                  timestamp: new Date().toLocaleString(),
                  executionStatus: "completed",
                },
              }
            : node
        )
      );

      setExecutionResult(result.result);
    } catch (error) {
      console.error("Execution failed:", error);
      alert(
        `Execution failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // Mark all nodes as error state
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isExecuting: false,
            executionStatus: node.data.isExecuting
              ? "error"
              : node.data.executionStatus,
          },
        }))
      );
    } finally {
      setIsExecuting(false);
      setCurrentExecutingNode(null);

      // Reset all execution highlighting after 3 seconds
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: {
              ...node.data,
              isExecuting: false,
              executionStatus: undefined,
            },
          }))
        );

        // Reset execution progress
        setExecutionProgress({
          completed: [],
          current: null,
          total: 0,
        });
      }, 3000);
    }
  };

  const onNodeDelete = useCallback(
    (nodeId: string) => {
      // Prevent deleting nodes if this is a shared workflow with view-only permission
      if (isSharedWorkflow && sharedPermission === "view") {
        return;
      }

      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges, isSharedWorkflow, sharedPermission]
  );

  const nodesWithDeleteHandler = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDelete: onNodeDelete,
      isSharedWorkflow,
      sharedPermission,
      // Ensure onChange callbacks are preserved for input nodes
      ...(node.type === "workflowInput" && {
        onChange: (value: string) => {
          // Prevent editing in shared view-only mode
          if (isSharedWorkflow && sharedPermission === "view") {
            return;
          }
          setNodes((nds) => {
            const updatedNodes = nds.map((n) => {
              if (n.id === node.id) {
                return { ...n, data: { ...n.data, value } };
              }
              return n;
            });
            return updatedNodes;
          });
        },
      }),
    },
  }));

  const handleSave = () => {
    // Prevent saving if this is a shared workflow with view-only permission
    if (isSharedWorkflow && sharedPermission === "view") {
      return;
    }

    if (onSave) {
      onSave(nodes, edges);
      setLastSaved(new Date().toLocaleTimeString());
    }
  };

  // Track connections and update node data when edges change
  // Handle node connections and data flow
  useEffect(() => {
    const updateConnections = () => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          // Only update AI nodes that have connectable inputs
          if (!['openai', 'openai-advanced', 'gemini', 'gemini-advanced', 'claude'].includes(node.type || '')) {
            return node;
          }

          const connectedInputs: { 
            input?: string; 
            prompt?: string; 
            context?: string;
            userPrompt?: string;
            systemInstruction?: string;
          } = {};

          // Find all edges that target this node
          const incomingEdges = edges.filter((edge) => edge.target === node.id);

          incomingEdges.forEach((edge) => {
            // Find the source node
            const sourceNode = currentNodes.find((n) => n.id === edge.source);
            if (!sourceNode) return;

            let sourceValue = "";

            // Extract value based on source node type
            if (sourceNode.type === "workflowInput") {
              sourceValue = typeof sourceNode.data.value === "string" ? sourceNode.data.value : "";
            } else if (sourceNode.type === "context") {
              sourceValue = typeof sourceNode.data.value === "string" ? sourceNode.data.value : "";
            } else if (sourceNode.type === "prompt") {
              sourceValue = typeof sourceNode.data.value === "string" ? sourceNode.data.value : "";
            }

            // Map the value to the correct target handle based on the target handle ID
            if (edge.targetHandle === "input") {
              connectedInputs.input = sourceValue;
            } else if (edge.targetHandle === "prompt") {
              connectedInputs.prompt = sourceValue;
            } else if (edge.targetHandle === "context") {
              connectedInputs.context = sourceValue;
            } else if (edge.targetHandle === "userPrompt") {
              connectedInputs.userPrompt = sourceValue;
            } else if (edge.targetHandle === "systemInstruction") {
              connectedInputs.systemInstruction = sourceValue;
            }
          });

          // Update node data with connected inputs
          return {
            ...node,
            data: {
              ...node.data,
              connectedInputs,
            },
          };
        })
      );
    };

    updateConnections();

    // Set up interval to update connections periodically to catch real-time changes
    const intervalId = setInterval(updateConnections, 300);

    return () => clearInterval(intervalId);
  }, [edges, setNodes]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Shared Workflow Handler - handles shared workflow detection and loading */}
      <SharedWorkflowHandler
        onWorkflowLoad={handleSharedWorkflowLoad}
        onSharedStateChange={handleSharedStateChange}
        onLoadingChange={handleSharedLoadingChange}
        onErrorChange={handleSharedErrorChange}
      />

      {/* Flow Header - only show if we have flow info */}
      <FlowHeader
        flowName={flowName}
        flowDescription={flowDescription}
        onNavigateBack={onNavigateBack}
        onShareClick={handleShareClick}
      />

      {/* Compact Top Toolbar */}
      <Toolbar
        isExecuting={isExecuting}
        nodesCount={nodes.length}
        isSharedWorkflow={isSharedWorkflow}
        sharedPermission={sharedPermission}
        onExecuteWorkflow={handleExecuteWorkflow}
        onSave={handleSave}
      />

      {/* Execution Progress Indicator */}
      <ExecutionProgressIndicator
        isExecuting={isExecuting}
        executionProgress={executionProgress}
        currentExecutingNode={currentExecutingNode}
        nodes={nodes}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onDragStart={onDragStart}
          disabled={isSharedWorkflow && sharedPermission === "view"}
        />

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 relative">
          <ReactFlow
            nodes={nodesWithDeleteHandler}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{
              animated: true,
              style: {
                stroke: "rgb(107 114 128)",
                strokeWidth: 2,
              },
            }}
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-lg !rounded-lg [&>button]:!bg-white dark:[&>button]:!bg-gray-800 [&>button]:!border-gray-200 dark:[&>button]:!border-gray-600 [&>button]:!text-gray-700 dark:[&>button]:!text-gray-300 [&>button:hover]:!bg-gray-50 dark:[&>button:hover]:!bg-gray-700 [&>button:hover]:!text-gray-900 dark:[&>button:hover]:!text-gray-100" />
            <MiniMap
              className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-lg !rounded-lg"
              nodeStrokeWidth={2}
              nodeColor={(n) => {
                if (n.type === "workflowInput") return "rgb(107 114 128)";
                if (n.type === "workflowOutput") return "rgb(107 114 128)";
                if (n.type === "openai") return "rgb(107 114 128)";
                if (n.type === "gemini") return "rgb(107 114 128)";
                if (n.type === "claude") return "rgb(107 114 128)";
                if (n.type === "email") return "rgb(107 114 128)";
                if (n.type === "hashnode") return "rgb(107 114 128)";
                if (n.type === "webhook") return "rgb(107 114 128)";
                return "rgb(156 163 175)";
              }}
              maskColor="rgba(0, 0, 0, 0.05)"
            />
            <Background
              gap={24}
              size={1}
              color="black"
              variant={BackgroundVariant.Dots}
              className="dark:[&>*]:!stroke-gray-700"
            />
          </ReactFlow>

          {/* Shared Workflow UI */}
          <SharedWorkflowUI
            isSharedWorkflow={isSharedWorkflow}
            sharedLoading={sharedLoading}
            sharedError={sharedError}
            sharedPermission={sharedPermission}
            nodesCount={nodes.length}
          />

          {/* Empty State */}
          {nodes.length === 0 && !isSharedWorkflow && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Layers className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Start Building Your Workflow
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Drag components from the sidebar to create your AI-powered
                  workflow. Connect nodes to define the flow of data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        nodesCount={nodes.length}
        edgesCount={edges.length}
        lastSaved={lastSaved}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareLink={shareLink}
        sharePermission={sharePermission}
        onPermissionChange={handlePermissionChange}
        onCopyLink={handleCopyLink}
        copySuccess={copySuccess}
      />

      {/* Execution Result Modal */}
      <ExecutionResultModal
        isOpen={!!executionResult}
        onClose={() => setExecutionResult(null)}
        result={executionResult || ""}
      />
    </div>
  );
}
