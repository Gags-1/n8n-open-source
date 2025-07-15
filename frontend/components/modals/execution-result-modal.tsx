import { X, Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExecutionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: string;
}

export function ExecutionResultModal({
  isOpen,
  onClose,
  result,
}: ExecutionResultModalProps) {
  if (!isOpen) return null;

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-gray-100 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white dark:text-gray-900" />
              </div>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Execution Result
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="max-h-96 overflow-y-auto mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <pre className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                {result}
              </pre>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCopyResult}
              className="border-gray-200 dark:border-gray-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={onClose}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
