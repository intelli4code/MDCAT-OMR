"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { loadSavedKeys, importKeys } from '@/lib/keys';
import type { AnswerKey } from '@/lib/types';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Trash2, Pencil, School, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

interface KeyManagementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onLoadKey: (key: AnswerKey, asQuiz: boolean) => void;
  onDeleteKey: (key: AnswerKey) => void;
}

export function KeyManagementModal({
  isOpen,
  onOpenChange,
  userId,
  onLoadKey,
  onDeleteKey,
}: KeyManagementModalProps) {
  const [keys, setKeys] = useState<AnswerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const savedKeys = await loadSavedKeys(userId);
      setKeys(savedKeys);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load keys. You may need to configure Firestore indexes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchKeys();
    }
  }, [isOpen, userId]);

  const handleExport = () => {
    if (keys.length === 0) {
      toast({ title: "Nothing to Export", description: "You have no saved keys."});
      return;
    }
    const dataStr = JSON.stringify(keys.map(({ id, createdAt, ...rest }) => rest), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'omr_quiz_master_keys.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') throw new Error("File content is not readable.");
        const importedData = JSON.parse(content);
        if (!Array.isArray(importedData)) throw new Error("JSON must be an array of keys.");
        
        // Basic validation
        const validKeys = importedData.filter(k => k.keyName && k.answers && typeof k.questionCount === 'number');
        
        if (validKeys.length === 0) {
          throw new Error("No valid keys found in the file.");
        }

        await importKeys(userId, validKeys);
        toast({ title: "Import Successful", description: `${validKeys.length} keys have been imported.` });
        fetchKeys(); // Refresh list

      } catch (err: any) {
        toast({ title: "Import Failed", description: err.message, variant: "destructive" });
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Answer Keys</DialogTitle>
          <DialogDescription>Load a key for editing or start a quiz. You can also import/export all your keys.</DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <Separator />
        </div>

        <ScrollArea className="h-[50vh] pr-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <p className="font-semibold">No Keys Found</p>
              <p className="text-sm">Save a key in the Key Editor to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-semibold">{key.keyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {key.questionCount} questions • Saved {formatDistanceToNow(key.createdAt.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onLoadKey(key, false)}><Pencil className="mr-2 h-4 w-4"/>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => onLoadKey(key, true)}><School className="mr-2 h-4 w-4"/>Quiz</Button>
                    <Button variant="destructive" size="icon" onClick={() => onDeleteKey(key)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/>Import</Button>
          <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4"/>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
