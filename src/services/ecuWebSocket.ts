export interface LiveECUData {
  timestamp: string;
  rpm: number;
  temperature: number;
  boostPressure: number;
  afr: number;
  load: number;
}

export class ECUWebSocketService {
  private ws: WebSocket | null = null;
  private onDataCallback: ((data: LiveECUData) => void) | null = null;
  private onStatusChangeCallback: ((status: 'connected' | 'disconnected' | 'error') => void) | null = null;

  connect() {
    // Connect to the WebSocket server on the same host/port
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to ECU Live Stream');
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data: LiveECUData = JSON.parse(event.data);
        if (this.onDataCallback) {
          this.onDataCallback(data);
        }
      } catch (error) {
        console.error('Failed to parse ECU data:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('error');
    };

    this.ws.onclose = () => {
      console.log('Disconnected from ECU Live Stream');
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('disconnected');
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onData(callback: (data: LiveECUData) => void) {
    this.onDataCallback = callback;
  }

  onStatusChange(callback: (status: 'connected' | 'disconnected' | 'error') => void) {
    this.onStatusChangeCallback = callback;
  }
}

export const ecuLiveStream = new ECUWebSocketService();
