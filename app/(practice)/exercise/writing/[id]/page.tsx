"use client";

import React, { use } from 'react';
import WritingTestComponent from '@/components/writing/WritingTestComponent';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

const WritingTestPage = ({ params }: PageProps) => {
  const { id: testId } = use(params);
  const router = useRouter();

  const handleComplete = async (data: any) => {
    // Store evaluation data and navigate to results
    sessionStorage.setItem('writingEvaluation', JSON.stringify(data));
    router.push(`/exercise/writing/${testId}/results`);
  };

  return (
    <WritingTestComponent
      testId={testId}
      mode="exercise"
      onComplete={handleComplete}
      backLink="/exercise/writing"
    />
  );
};

export default WritingTestPage;
