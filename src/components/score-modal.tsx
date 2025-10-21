"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Award } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: { correct: number; incorrect: number; total: number };
}

export function ScoreModal({ isOpen, onOpenChange, result }: ScoreModalProps) {
  const { correct, incorrect, total } = result;
  const percentage = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';
  const attempted = correct + incorrect;
  const unattempted = total - attempted;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-2xl gap-2">
            <Award className="h-8 w-8 text-yellow-500" />
            Quiz Results
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Here's how you performed. You can now review the correct answers on the sheet.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 flex flex-col items-center justify-center gap-2">
            <p className="text-6xl font-bold text-primary">{correct} <span className="text-3xl font-medium text-muted-foreground">/ {total}</span></p>
            <p className="text-2xl font-semibold text-accent-foreground">{percentage}%</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold text-success">{correct}</p>
            </div>
             <div>
                <p className="text-sm text-muted-foreground">Incorrect</p>
                <p className="text-2xl font-bold text-destructive">{incorrect}</p>
            </div>
             <div>
                <p className="text-sm text-muted-foreground">Unattempted</p>
                <p className="text-2xl font-bold">{unattempted}</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
