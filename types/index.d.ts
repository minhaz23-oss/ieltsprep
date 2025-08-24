interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

// Auth form types
type FormType = 'sign-in' | 'sign-up';

// Auth action parameter types
interface SignUpParams {
  uid: string;
  email: string;
  password: string;
  name: string;
}

interface SignInParams {
  email: string;
  idToken: string;
  name?: string;
  uid:string
}
