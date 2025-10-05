import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the readingTests folder
    const testsDirectory = path.join(process.cwd(), 'public', 'readingTests');
    
    // Check if directory exists
    if (!fs.existsSync(testsDirectory)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Reading tests directory not found',
        data: [] 
      });
    }

    // Read all JSON files from the directory
    const files = fs.readdirSync(testsDirectory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Read and parse each JSON file to get test metadata
    const tests = jsonFiles.map(filename => {
      try {
        const filePath = path.join(testsDirectory, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const testData = JSON.parse(fileContent);
        
        // Extract the ID from filename (e.g., "reading13_t1.json" -> "reading13_t1")
        const id = filename.replace('.json', '');
        
        // Extract version number (e.g., "reading13_t1" -> "13")
        const versionMatch = id.match(/reading(\d+)_t/);
        const version = versionMatch ? versionMatch[1] : '1';
        
        return {
          id,
          title: testData.test?.title || 'IELTS Reading Test',
          totalQuestions: testData.test?.totalQuestions || 40,
          timeLimit: testData.test?.totalTime || 60,
          version,
          passages: testData.test?.passages?.length || 3
        };
      } catch (error) {
        console.error(`Error reading file ${filename}:`, error);
        return null;
      }
    }).filter(test => test !== null);

    return NextResponse.json({ 
      success: true, 
      data: tests,
      message: `Found ${tests.length} reading tests`
    });
  } catch (error) {
    console.error('Error loading reading tests:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to load reading tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
