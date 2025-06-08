"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ReplyFormProps {
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  value: string;
  onChange: (value: string) => void;
  submitting: boolean;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  onCancel,
  value,
  onChange,
  submitting,
}) => {  return (
    <div className="mt-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a reply..."
        className="min-h-[80px] mb-2 focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button 
          onClick={onCancel} 
          variant="outline" 
          size="sm"
          className="transition-all duration-200"
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={!value.trim() || submitting}
          size="sm"
          className="transition-all duration-200"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Submitting...
            </>
          ) : (
            "Post Reply"
          )}
        </Button>
      </div>
    </div>
  );
};
