import { Button } from "@/components/ui/button";

interface NodeDeleteButtonProps {
  onDelete: () => void;
}

export function NodeDeleteButton({ onDelete }: NodeDeleteButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onDelete}
      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 dark:hover:border-red-700 transition-all duration-200"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path 
          d="M18 6L6 18M6 6l12 12" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );
}