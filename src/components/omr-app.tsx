"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Answer, AnswerKey, AnswerMap } from '@/lib/types';
import { saveNewKey, loadSavedKeys, deleteKey, importKeys } from '@/lib/keys';
import { useToast } from '@/hooks/use-toast';

import { Header } from './header';
import { ControlPanel } from './control-panel';
import { OmrSheet } from './omr-sheet';
import { InfoPanel } from './info-panel';
import { AuthModal } from './auth-modal';
import { KeyManagementModal } from './key-management-modal';
import { ScoreModal } from './score-modal';
import { ConfirmDialog } from './confirm-dialog';

type AppMode = 'key_edit' | 'quiz' | 'view';
type DialogState = 'saveKey' | 'deleteKey' | null;

export default function OmrApp() {
  const { userId, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Core State
  const [questionCount, setQuestionCount] = useState(200);
  const [answers, setAnswers] = useState<AnswerMap>(new Map());
  const [mode, setMode] = useState<AppMode>('view');

  // Quiz State
  const [masterKey, setMasterKey] = useState<AnswerKey | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: number; incorrect: number; total: number } | null>(null);

  // UI State
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isKeyModalOpen, setKeyModalOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [keyToDelete, setKeyToDelete] = useState<AnswerKey | null>(null);

  const handleBubbleClick = useCallback((question: number, option: Answer) => {
    if (mode === 'view') return;

    setAnswers(prev => {
      const newAnswers = new Map(prev);
      if (newAnswers.get(question) === option) {
        newAnswers.delete(question);
      } else {
        newAnswers.set(question, option);
      }
      return newAnswers;
    });
  }, [mode]);
  
  const resetSheet = () => {
    setAnswers(new Map());
    setQuizResult(null);
  };

  const handleSetQuestionCount = (count: number) => {
    setQuestionCount(count);
    resetSheet();
  };

  const handleModeChange = (newMode: AppMode) => {
    if (newMode === 'key_edit' && !isAuthenticated) {
      toast({ title: "Authentication Required", description: "Please log in to create or edit answer keys.", variant: "destructive" });
      return;
    }
    setMode(newMode);
    setMasterKey(null);
    if(newMode !== 'quiz') {
      setQuizResult(null);
    }
  };

  const handleSaveKey = async (keyName: string) => {
    if (!userId || !isAuthenticated) return;
    try {
      await saveNewKey(userId, keyName, answers);
      toast({ title: "Success", description: `Key "${keyName}" saved.` });
      setDialogState(null);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not save the key.", variant: "destructive" });
    }
  };

  const handleLoadKey = (key: AnswerKey, asQuiz: boolean) => {
    resetSheet();
    setQuestionCount(key.questionCount);
    if (asQuiz) {
      setMasterKey(key);
      setMode('quiz');
      toast({ title: "Quiz Mode Started", description: `Loaded key: "${key.keyName}"` });
    } else {
      const loadedAnswers = new Map(Object.entries(key.answers).map(([q, a]) => [Number(q), a as Answer]));
      setAnswers(loadedAnswers);
      setMode('key_edit');
      toast({ title: "Key Loaded", description: `Now editing: "${key.keyName}"` });
    }
    setKeyModalOpen(false);
  };

  const openDeleteKeyDialog = (key: AnswerKey) => {
    setKeyToDelete(key);
    setDialogState('deleteKey');
  };

  const handleDeleteKey = async (confirmation: string) => {
    if (!userId || !keyToDelete || confirmation !== keyToDelete.keyName) {
      toast({ title: "Error", description: "Key name did not match. Deletion cancelled.", variant: "destructive" });
      setDialogState(null);
      setKeyToDelete(null);
      return;
    }
    try {
      await deleteKey(userId, keyToDelete.id);
      toast({ title: "Success", description: `Key "${keyToDelete.keyName}" deleted.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete the key.", variant: "destructive" });
    }
    setDialogState(null);
    setKeyToDelete(null);
    // Will force KeyManagementModal to re-fetch
  };

  const handleEndQuiz = () => {
    if (!masterKey) return;
    let correct = 0;
    let incorrect = 0;
    const total = Object.keys(masterKey.answers).length;

    for (const q in masterKey.answers) {
      const questionNum = Number(q);
      const correctAnwer = masterKey.answers[questionNum];
      const studentAnswer = answers.get(questionNum);

      if (studentAnswer) {
        if (studentAnswer === correctAnwer) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }
    setQuizResult({ correct, incorrect, total });
    setMode('view');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header onAuthClick={() => setAuthModalOpen(true)} />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <ControlPanel
          questionCount={questionCount}
          onQuestionCountChange={handleSetQuestionCount}
          mode={mode}
          onModeChange={handleModeChange}
          onManageKeys={() => setKeyModalOpen(true)}
          onSaveKey={() => setDialogState('saveKey')}
          onEndQuiz={handleEndQuiz}
          masterKeyName={masterKey?.keyName}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div className="lg:col-span-2 xl:col-span-3">
            <OmrSheet
              questionCount={questionCount}
              answers={answers}
              onBubbleClick={handleBubbleClick}
              mode={mode}
              quizResult={quizResult}
              masterKeyAnswers={masterKey?.answers}
            />
          </div>
          <div className="lg:col-span-1 xl:col-span-1">
            <InfoPanel />
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setAuthModalOpen} />
      
      {userId && (
        <KeyManagementModal
          isOpen={isKeyModalOpen}
          onOpenChange={setKeyModalOpen}
          userId={userId}
          onLoadKey={handleLoadKey}
          onDeleteKey={openDeleteKeyDialog}
        />
      )}

      {quizResult && (
        <ScoreModal
          result={quizResult}
          isOpen={quizResult !== null}
          onOpenChange={() => { if(quizResult) setQuizResult(null); }}
        />
      )}

      <ConfirmDialog
        isOpen={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
        title={dialogState === 'saveKey' ? 'Save New Key' : 'Confirm Deletion'}
        description={dialogState === 'saveKey' ? 'Please enter a name for your new answer key.' : `To delete "${keyToDelete?.keyName}", please type its name below.`}
        onConfirm={dialogState === 'saveKey' ? handleSaveKey : handleDeleteKey}
        showInput={true}
        confirmText={dialogState === 'saveKey' ? 'Save' : 'Delete'}
      />
    </div>
  );
}
