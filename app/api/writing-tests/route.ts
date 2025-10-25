import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const writingTestsDir = path.join(process.cwd(), 'public', 'writingTests');
    
    // Check if directory exists
    if (!fs.existsSync(writingTestsDir)) {
      return NextResponse.json({
        success: false,
        message: 'Writing tests directory not found',
        data: []
      });
    }

    // Read all JSON files in the directory
    const files = fs.readdirSync(writingTestsDir)
      .filter(file => file.endsWith('.json'));

    const tests = files.map(file => {
      try {
        const filePath = path.join(writingTestsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const testData = JSON.parse(fileContent);
        
        // Extract metadata for listing
        const testId = file.replace('.json', '');
        const totalTasks = testData.tasks ? testData.tasks.length : 0;
        const timeLimit = testData.tasks 
          ? testData.tasks.reduce((acc: number, task: any) => {
              const time = parseInt(task.timeAllocation.match(/\d+/)?.[0] || '0');
              return acc + time;
            }, 0)
          : 60;

        // Extract version from filename (e.g., writingTest1 -> 1, writing13_t1 -> 13)
        let version = '1';
        const versionMatch = testId.match(/(?:writing|writingTest)(\d+)/);
        if (versionMatch) {
          version = versionMatch[1];
        }

        return {
          id: testId,
          title: testData.testTitle || `Writing Practice Test ${version}`,
          totalTasks,
          timeLimit,
          version
        };
      } catch (error) {
        console.error(`Error reading test file ${file}:`, error);
        return null;
      }
    }).filter(test => test !== null);

    return NextResponse.json({
      success: true,
      data: tests,
      message: `Found ${tests.length} writing tests`
    });

  } catch (error) {
    console.error('Error loading writing tests:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to load writing tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
