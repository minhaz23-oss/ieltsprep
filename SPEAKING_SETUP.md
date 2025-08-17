# IELTS Speaking Test Setup Guide

## Overview
This implementation provides a complete IELTS speaking test solution with two modes:
1. **VAPI AI Conversation Mode**: Real-time conversation with AI examiner
2. **Practice Mode**: Structured questions with timers and recording

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# VAPI Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Google AI (Gemini) Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
# OR
GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Steps

### 1. VAPI Setup
1. Sign up at [vapi.ai](https://vapi.ai)
2. Create a new project
3. Get your web token from the dashboard
4. Create an assistant or use an existing one
5. Get your assistant ID from the dashboard

### 2. Google AI (Gemini) Setup
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the API key to your environment variables

### 3. Test the Implementation
1. Start your development server: `npm run dev`
2. Navigate to `/exercise/speaking`
3. Choose between VAPI mode or Practice mode
4. Test the functionality

## Features

### VAPI Mode
- Real-time AI conversation
- Automatic question-answer extraction
- Conversation history tracking
- Seamless integration with VAPI assistant

### Practice Mode
- Predefined IELTS questions
- Timer-based responses
- Audio recording capabilities
- Structured evaluation

### Evaluation
- Gemini AI-powered assessment
- IELTS band scoring (1-9)
- Detailed feedback on all criteria
- Personalized improvement suggestions

## File Structure

```
components/speaking/
├── VapiSpeakingSession.tsx    # VAPI integration component
├── SpeakingTestSession.tsx    # Practice mode component
└── VoiceRecorder.tsx          # Audio recording component

app/api/
└── evaluate-speaking/
    └── route.ts               # Gemini evaluation API

lib/
├── actions/
│   └── speaking.actions.ts    # Server actions
├── utils/
│   └── ielts-scoring.ts      # Scoring utilities
└── vapi.sdk.ts               # VAPI client setup
```

## Troubleshooting

### Common Issues

1. **VAPI Connection Failed**
   - Check your VAPI token and workflow ID
   - Ensure you're using HTTPS or localhost
   - Check browser console for errors

2. **Microphone Access Denied**
   - Allow microphone permissions in browser
   - Check if microphone is being used by other apps
   - Ensure you're on HTTPS or localhost

3. **Evaluation Failed**
   - Verify Gemini API key is set
   - Check API response in browser console
   - Ensure responses contain valid text

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

### Modifying Questions
Edit the `MOCK_QUESTIONS` array in `SpeakingTestSession.tsx` to customize practice questions.

### Adjusting Scoring
Modify the evaluation prompts in `/api/evaluate-speaking/route.ts` to adjust scoring criteria.

### VAPI Assistant
Customize your VAPI assistant in the dashboard to modify the AI examiner's behavior and prompts.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure you have the required API keys and permissions
4. Check the network tab for failed API requests
