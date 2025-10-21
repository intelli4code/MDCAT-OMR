"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

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

      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Instructions</AlertTitle>
        <AlertDescription className="space-y-2 text-destructive/90">
          <p>1. Use BLUE or BLACK BALL POINT PEN only.</p>
          <p>2. CORRECT EXAMPLE: &bull;</p>
          <p>3. INCORRECT EXAMPLES: &bigcirc; &times; &#10003;</p>
          <p>4. Darken only one bubble for each question.</p>
          <p>5. Do not use markers or white fluid on the sheet.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
