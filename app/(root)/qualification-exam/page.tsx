import { Suspense } from 'react';
import QualificationExamClient from './QualificationExamClient';

export const metadata = {
  title: 'Unlock Premium - Qualification Exam | IELTS Prep',
  description: 'Take our English proficiency exam to unlock premium features for free!',
};

export default function QualificationExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    }>
      <QualificationExamClient />
    </Suspense>
  );
}
