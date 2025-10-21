import type { Timestamp } from 'firebase/firestore';

export type Answer = 'A' | 'B' | 'C' | 'D';

export type AnswerMap = Map<number, Answer>;

export type AnswerKey = {
  id: string;
  keyName: string;
  questionCount: number;
  answers: { [key: number]: Answer };
  createdAt: Timestamp;
};
