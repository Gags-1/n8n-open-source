import { useState } from "react";
import { Share2, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
  sharePermission: "view" | "edit";
  onPermissionChange: (permission: "view" | "edit") => void;
  onCopyLink: () => Promise<void>;
  copySuccess: boolean;
}

export function ShareModal({
  isOpen,
  onClose,
  shareLink,
  sharePermission,
  onPermissionChange,
  onCopyLink,
  copySuccess,
}: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-0 shadow-xl">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-blue-500/10 flex items-center justify-center">
                  <Share2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Share Workflow
                </h2>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Generate a shareable link
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="px-5 pb-5 space-y-4">
          {/* Permission Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Access Level
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onPermissionChange("view")}
                className={`relative p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                  sharePermission === "view"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                    View Only
                  </span>
                  {sharePermission === "view" && (
                    <div className="h-3 w-3 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  View and run only
                </p>
              </button>
              
              <button
                onClick={() => onPermissionChange("edit")}
                className={`relative p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                  sharePermission === "edit"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                    Can Edit
                  </span>
                  {sharePermission === "edit" && (
                    <div className="h-3 w-3 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Full access
                </p>
              </button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Share Link
            </Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-8 cursor-default"
                placeholder="Generating..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyLink}
                className={`px-3 h-8 border-gray-200 dark:border-gray-700 transition-colors cursor-pointer ${
                  copySuccess 
                    ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-950/50" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
            <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-relaxed">
              Anyone with this link can access your workflow with{" "}
              <span className="font-medium">
                {sharePermission === "view" ? "view-only" : "editing"}
              </span>{" "}
              permissions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 h-8 px-3 cursor-pointer"
            >
              <span className="text-xs">Cancel</span>
            </Button>
            <Button
              onClick={onCopyLink}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 cursor-pointer"
            >
              <span className="text-xs">{copySuccess ? "Copied!" : "Copy Link"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
