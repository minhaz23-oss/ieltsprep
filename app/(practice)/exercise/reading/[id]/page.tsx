"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ReadingTestComponent from '@/components/reading/ReadingTestComponent';

const IELTSReadingTest = () => {
  const params = useParams();
  const testId = params.id as string;
  
  return (
    <ReadingTestComponent 
      testId={testId}
      mode="exercise"
      backLink="/exercise/reading"
    />
  );
};

export default IELTSReadingTest;