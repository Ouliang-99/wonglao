// WongLao WebSocket Client Manager for Real-Time Multi-Device Room Sync

class WongLaoWebSocketClient {
  constructor() {
    this.ws = null;
    this.roomCode = null;
    this.playerId = null;
    this.isHost = false;
    this.players = [];
    this.gameState = {};
    this.listeners = [];
    this.serverUrl = this.getWsUrl();
  }

  getWsUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    // Use port 8080 for WebSocket server when running locally
    return `${protocol}//${host}:8080`;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        console.log('⚡ Connected to WongLao WebSocket Server');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      this.ws.onclose = () => {
        console.log('WS Connection closed. Attempting reconnect in 3s...');
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('WS Connection error:', err);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  }

  handleServerMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'ROOM_CREATED':
      case 'ROOM_JOINED':
        this.roomCode = payload.roomCode;
        this.playerId = payload.playerId;
        this.isHost = type === 'ROOM_CREATED';
        this.players = payload.players;
        this.gameState = payload.gameState || {};
        break;

      case 'PLAYER_JOINED':
      case 'PLAYER_LEFT':
        this.players = payload.players;
        break;

      case 'SYNC_GAME_STATE':
        this.gameState = { ...this.gameState, ...payload.state };
        break;

      default:
        break;
    }

    this.notifyListeners(data);
  }

  createRoom(playerName, playerAvatar) {
    this.connect();
    this.sendWhenReady({
      type: 'CREATE_ROOM',
      payload: { playerName, playerAvatar }
    });
  }

  joinRoom(roomCode, playerName, playerAvatar) {
    this.connect();
    this.sendWhenReady({
      type: 'JOIN_ROOM',
      payload: { roomCode, playerName, playerAvatar }
    });
  }

  sendAction(actionType, stateData, customMessage = '') {
    this.sendWhenReady({
      type: 'GAME_ACTION',
      payload: {
        actionType,
        ...stateData,
        customMessage
      }
    });
  }

  buzzPlayer(targetPlayerId, message) {
    this.sendWhenReady({
      type: 'BUZZ_PLAYER',
      payload: { targetPlayerId, message }
    });
  }

  sendWhenReady(msgObj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msgObj));
    } else {
      // Connect and retry once open
      this.connect();
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(msgObj));
        }
      }, 500);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((l) => l(data));
  }

  leaveRoom() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.roomCode = null;
    this.playerId = null;
    this.isHost = false;
    this.players = [];
    this.gameState = {};
  }
}

export const wsClient = new WongLaoWebSocketClient();
