'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { transferCredit } from '@/utils/creditApi';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface CreditTransferProps {
  recipientId: string;
  recipientName: string;
  disabled?: boolean;
}

export function CreditTransferButton({ recipientId, recipientName, disabled = false }: CreditTransferProps) {
  const [amount, setAmount] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await transferCredit(recipientId, amount);
      toast.success(result.message);
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to transfer credit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled}
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          Send Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Credits</DialogTitle>
          <DialogDescription>
            Send credits to {recipientName || 'this user'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleTransfer}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Credits'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
