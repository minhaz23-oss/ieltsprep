"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ListeningTestComponent from '@/components/listening/ListeningTestComponent';

const IELTSListeningTest = () => {
  const params = useParams();
  const testId = params.id as string;
  
  return (
    <ListeningTestComponent 
      testId={testId}
      mode="exercise"
      backLink="/exercise/listening"
    />
  );
};

export default IELTSListeningTest;