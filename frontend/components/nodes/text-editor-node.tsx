import { Handle, Position } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit3, Save, StickyNote } from "lucide-react";
import { useState, useRef } from "react";
import { NodeDeleteButton } from "@/components/node-delete-button";

interface TextEditorNodeProps {
  data: {
    value?: string;
    onChange?: (value: string) => void;
    onDelete?: (nodeId: string) => void;
    isSharedWorkflow?: boolean;
    sharedPermission?: "view" | "edit";
  };
  id: string;
}

export function TextEditorNode({ data, id }: TextEditorNodeProps) {
  const [content, setContent] = useState(data.value || "");
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReadOnly = data.isSharedWorkflow && data.sharedPermission === "view";

  const handleContentSave = () => {
    if (data.onChange) {
      data.onChange(content);
    }
    setIsEditing(false);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleEditToggle = () => {
    if (isReadOnly) return;
    
    if (isEditing) {
      handleContentSave();
    } else {
      setIsEditing(true);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg shadow-lg p-4 min-w-[250px] min-h-[150px] max-w-[400px] relative">
      {/* Delete button */}
      {!isReadOnly && (
        <div className="absolute -top-2 -right-2">
          <NodeDeleteButton
            onDelete={() => data.onDelete?.(id)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <StickyNote size={16} className="text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Sticky Note
        </span>
        {!isReadOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-auto hover:bg-yellow-100 dark:hover:bg-yellow-800"
            onClick={handleEditToggle}
          >
            {isEditing ? (
              <Save size={12} className="text-green-600" />
            ) : (
              <Edit3 size={12} className="text-yellow-600" />
            )}
          </Button>
        )}
      </div>

      {/* Content area */}
      <div className="relative">
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your notes here..."
            className="min-h-[100px] resize-none border-yellow-200 dark:border-yellow-700 bg-transparent text-sm focus:ring-1 focus:ring-yellow-500"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setContent(data.value || "");
                setIsEditing(false);
              } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleContentSave();
              }
            }}
          />
        ) : (
          <div 
            className={`min-h-[100px] p-2 text-sm text-yellow-800 dark:text-yellow-200 whitespace-pre-wrap ${!isReadOnly ? 'cursor-text' : ''}`}
            onClick={handleEditToggle}
          >
            {content || (
              <span className="text-yellow-500 italic">
                {isReadOnly ? "Empty note" : "Click to add notes..."}
              </span>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex justify-between">
          <span>Ctrl+Enter to save</span>
          <span>Esc to cancel</span>
        </div>
      )}
    </div>
  );
}
