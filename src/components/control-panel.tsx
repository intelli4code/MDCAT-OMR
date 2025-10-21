"use client";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { BookKey, FileJson, LogIn, Pencil, Save, School } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type AppMode = 'key_edit' | 'quiz' | 'view';

interface ControlPanelProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onManageKeys: () => void;
  onSaveKey: () => void;
  onStartQuiz: () => void;
  onEndQuiz: () => void;
  masterKeyName?: string | null;
  hasAnswers: boolean;
}

export function ControlPanel({
  questionCount,
  onQuestionCountChange,
  mode,
  onModeChange,
  onManageKeys,
  onSaveKey,
  onStartQuiz,
  onEndQuiz,
  masterKeyName,
  hasAnswers,
}: ControlPanelProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
          
          <div className="space-y-3">
            <Label htmlFor="question-slider" className="font-semibold">
              Total Questions: {questionCount}
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">10</span>
              <Slider
                id="question-slider"
                min={10}
                max={200}
                step={10}
                value={[questionCount]}
                onValueChange={(value) => onQuestionCountChange(value[0])}
                disabled={mode === 'quiz'}
              />
              <span className="text-sm font-medium text-muted-foreground">200</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={mode === 'key_edit' ? 'default' : 'outline'}
              onClick={() => onModeChange(mode === 'key_edit' ? 'view' : 'key_edit')}
              disabled={!isAuthenticated || mode === 'quiz'}
              title={!isAuthenticated ? "Log in to enable" : "Toggle Key Editor"}
            >
              <Pencil className="mr-2" />
              Key Editor
            </Button>

            <Button
              variant={mode === 'quiz' ? 'destructive' : 'outline'}
              onClick={mode === 'quiz' ? onEndQuiz : onStartQuiz}
              disabled={(mode !== 'quiz' && (mode !== 'key_edit' || !hasAnswers))}
            >
              <School className="mr-2" />
              {mode === 'quiz' ? 'End Quiz' : 'Start Quiz'}
            </Button>
             
            {mode === 'quiz' && masterKeyName && (
               <Badge variant="secondary" className="font-mono">{masterKeyName}</Badge>
            )}
             {mode === 'key_edit' && (
               <Badge variant="secondary">Editing...</Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
            <Button
              variant="outline"
              onClick={onManageKeys}
              disabled={!isAuthenticated}
              title={!isAuthenticated ? "Log in to enable" : "Manage Keys"}
            >
              <BookKey className="mr-2" />
              Manage Keys
            </Button>
            <Button
              onClick={onSaveKey}
              disabled={mode !== 'key_edit'}
              title={mode !== 'key_edit' ? "Enable Key Editor to save" : "Save Current Key"}
            >
              <Save className="mr-2" />
              Save Key
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "./ui/card";