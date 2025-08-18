import Vapi from "@vapi-ai/web";
import { validateVapiToken, getVapiToken } from "./actions/speaking.actions";

type VapiEventNames = 'call-start' | 'call-end' | 'message' | 'error' | 'speech-start' | 'speech-end';

class VapiManager {
  private vapi: Vapi | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      if (!validateVapiToken()) {
        console.error('VAPI token is missing or invalid. Please check your environment variables.');
        return;
      }

      const token = getVapiToken();
      if (!token) {
        throw new Error('VAPI token not found');
      }

      this.vapi = new Vapi(token);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
      this.isInitialized = false;
    }
  }

  public getVapi(): Vapi | null {
    if (!this.isInitialized || !this.vapi) {
      console.error('VAPI is not properly initialized');
      return null;
    }
    return this.vapi;
  }

  public isReady(): boolean {
    return this.isInitialized && this.vapi !== null;
  }

  public start(config?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isReady()) {
        reject(new Error('VAPI is not initialized'));
        return;
      }

      try {
        this.vapi!.start(config);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isReady()) {
        reject(new Error('VAPI is not initialized'));
        return;
      }

      try {
        this.vapi!.stop();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public on(event: VapiEventNames, callback: (data: any) => void): void {
    if (!this.isReady()) {
      console.error('Cannot add event listener: VAPI is not initialized');
      return;
    }
    (this.vapi as any).on(event, callback);
  }

  public off(event: VapiEventNames, callback: (data: any) => void): void {
    if (!this.isReady()) {
      console.error('Cannot remove event listener: VAPI is not initialized');
      return;
    }
    (this.vapi as any).off(event, callback);
  }
}

// Export singleton instance
export const vapi = new VapiManager();

// Export the class for testing purposes
export { VapiManager };