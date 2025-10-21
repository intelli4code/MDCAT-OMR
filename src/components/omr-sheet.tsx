"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Answer, AnswerMap } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type AppMode = 'key_edit' | 'quiz' | 'view';

interface BubbleProps {
  question: number;
  option: Answer;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isKeyCorrect?: boolean;
  onClick: (question: number, option: Answer) => void;
  disabled: boolean;
}

const Bubble: React.FC<BubbleProps> = ({ question, option, isSelected, isCorrect, isIncorrect, isKeyCorrect, onClick, disabled }) => {
  const bubbleClasses = cn(
    'flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-150',
    'font-mono font-bold text-sm',
    disabled 
      ? 'cursor-not-allowed bg-muted text-muted-foreground border-muted'
      : 'cursor-pointer',
    // Default state
    !isSelected && !isKeyCorrect && 'border-primary bg-transparent text-primary hover:bg-accent/20',
    // Selected by student
    isSelected && 'bg-primary text-primary-foreground border-primary',
    // Feedback states (override others)
    isKeyCorrect && !isSelected && 'border-success border-dashed bg-transparent text-success',
    isSelected && isCorrect && 'bg-success border-success text-success-foreground',
    isSelected && isIncorrect && 'bg-destructive border-destructive text-destructive-foreground',
  );

  return (
    <div
      className={bubbleClasses}
      data-question={question}
      data-option={option}
      onClick={() => !disabled && onClick(question, option)}
      aria-label={`Question ${question}, Option ${option}`}
      role="radio"
      aria-checked={isSelected}
    >
      {option}
    </div>
  );
};


interface OmrSheetProps {
  questionCount: number;
  answers: AnswerMap;
  onBubbleClick: (question: number, option: Answer) => void;
  mode: AppMode;
  isReviewing: boolean;
  quizResult: { correct: number; incorrect: number; total: number } | null;
  masterKeyAnswers?: { [key: number]: Answer };
}

export function OmrSheet({
  questionCount,
  answers,
  onBubbleClick,
  mode,
  isReviewing,
  quizResult,
  masterKeyAnswers,
}: OmrSheetProps) {
  const options: Answer[] = ['A', 'B', 'C', 'D'];
  const questionsPerColumn = 40;

  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < questionCount; i += questionsPerColumn) {
      cols.push(
        Array.from({ length: Math.min(questionsPerColumn, questionCount - i) }, (_, j) => i + j + 1)
      );
    }
    return cols;
  }, [questionCount]);

  const isDisabled = mode === 'view' && !isReviewing;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2">
              <div className="flex justify-around items-center sticky top-0 bg-card z-10 py-2 border-b">
                 <span className="font-bold text-sm text-muted-foreground">#</span>
                 {options.map(opt => <span key={opt} className="font-bold text-sm w-7 text-center text-muted-foreground">{opt}</span>)}
              </div>
              <div className="flex flex-col gap-3 pt-2">
                {col.map((q) => {
                  const studentAnswer = answers.get(q);
                  const keyAnswer = masterKeyAnswers?.[q];
                  
                  return (
                    <div key={q} className="flex justify-around items-center">
                      <div className="font-bold text-sm w-6 text-center">{q}</div>
                      {options.map((opt) => {
                        const isSelected = studentAnswer === opt;
                        const isKeyCorrect = isReviewing ? keyAnswer === opt : false;
                        const isCorrect = isReviewing ? isSelected && studentAnswer === keyAnswer : undefined;
                        const isIncorrect = isReviewing ? isSelected && studentAnswer !== keyAnswer : undefined;

                        return (
                          <Bubble
                            key={opt}
                            question={q}
                            option={opt}
                            isSelected={isSelected}
                            isCorrect={isCorrect}
                            isIncorrect={isIncorrect}
                            isKeyCorrect={isKeyCorrect}
                            onClick={onBubbleClick}
                            disabled={isDisabled}
                          />
                        )
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
