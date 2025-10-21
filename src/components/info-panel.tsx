"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info, Terminal } from 'lucide-react';

const RollNoGrid = () => {
  const [selections, setSelections] = useState<Map<number, number>>(new Map());

  const handleSelect = (row: number, digit: number) => {
    setSelections(prev => {
      const newSelections = new Map(prev);
      newSelections.set(row, digit);
      return newSelections;
    });
  };

  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex justify-between">
          {Array.from({ length: 10 }).map((_, colIndex) => {
            const isSelected = selections.get(rowIndex) === colIndex;
            return (
              <div
                key={colIndex}
                onClick={() => handleSelect(rowIndex, colIndex)}
                className={cn(
                  'flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border text-xs font-mono transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/50 hover:bg-accent'
                )}
              >
                {colIndex}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export function InfoPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roll No.</CardTitle>
        </CardHeader>
        <CardContent>
          <RollNoGrid />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="text" placeholder="Name" />
          <Input type="text" placeholder="Father's Name" />
          <Input type="text" placeholder="Candidate's Signature" className="font-serif italic"/>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to Use OMR Quiz Master</AlertTitle>
        <AlertDescription className="space-y-2">
          <p><strong>1. Login:</strong> Sign in to save, manage, and sync your answer keys across devices.</p>
          <p><strong>2. Create a Key:</strong> Click 'Key Editor' to manually create an answer key by selecting the correct bubbles. Click 'Save Key' when you're done.</p>
          <p><strong>3. Start a Quiz:</strong> Click 'Manage Keys', choose a saved key, and click 'Quiz' to start a new session.</p>
          <p><strong>4. Take the Quiz:</strong> Fill in the OMR sheet. When you're finished, click 'End Quiz'.</p>
          <p><strong>5. Review Results:</strong> After ending the quiz, your score will appear. Close the popup to review your answers on the sheet. Correct answers are outlined in green, and your incorrect selections are highlighted in red.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
