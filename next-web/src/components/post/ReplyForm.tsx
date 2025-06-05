"use client";
//NO MORE USE THIS CODE, USE "./comments/" INSTEAD
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
}) => {
  return (
    <div className="mt-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a reply..."
        className="min-h-[80px] mb-2"
      />
      <div className="flex gap-2">
        <Button 
          onClick={onSubmit} 
          disabled={!value.trim() || submitting}
          size="sm"
        >
          {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Reply
        </Button>
        <Button 
          onClick={onCancel} 
          variant="outline" 
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ReplyForm;
