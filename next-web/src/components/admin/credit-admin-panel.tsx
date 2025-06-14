'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast, { Toaster } from 'react-hot-toast';

const intervals = [
  { label: 'Every Hour', value: '0 * * * *' },
  { label: 'Every Day', value: '0 0 * * *' },
  { label: 'Every Week', value: '0 0 * * 0' },
  { label: 'Every Month', value: '0 0 1 * *' },
];

export default function CreditAdminPanel() {
  const [selectedInterval, setSelectedInterval] = useState('0 * * * *');
  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdateInterval = async () => {
    setIsUpdating(true);
    try {
      await fetch('/api/account/credit/distribution-interval', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interval: selectedInterval }),
      });
      
      toast.success('Credit distribution interval updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update interval');
    } finally {
      setIsUpdating(false);
    }
  };

  const getIntervalDescription = (value: string) => {
    const interval = intervals.find(i => i.value === value);
    return interval ? interval.label : 'Custom';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Credit Distribution Settings</CardTitle>
        <CardDescription>
          Configure how often credit points are distributed from followers to authors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="interval" className="text-sm font-medium">
            Distribution Interval
          </label>
          
          <Select
            value={selectedInterval}
            onValueChange={setSelectedInterval}
          >
            <SelectTrigger id="interval">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              {intervals.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <p className="text-sm text-gray-500">
            Credits will be distributed {getIntervalDescription(selectedInterval).toLowerCase()}.
            Each follower with available credit will send 1 credit to authors they follow.
          </p>
        </div>

        <Button 
          onClick={handleUpdateInterval} 
          disabled={isUpdating} 
          className="mt-4"
        >
          {isUpdating ? 'Updating...' : 'Update Settings'}
        </Button>
      </CardContent>
      <Toaster />
    </Card>
  );
}
