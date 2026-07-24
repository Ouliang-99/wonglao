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
    this.shouldReconnect = true;
    this.pendingQueue = [];
    this.serverUrl = this.getWsUrl();
  }

  getWsUrl() {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.hostname}:8080`;
    }

    // Production Render WebSocket Server URL
    return 'wss://wonglao.onrender.com';
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        console.log('⚡ Connected to WongLao WebSocket Server:', this.serverUrl);
        this.flushPendingQueue();
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
        console.log('WS Connection closed.');
        if (this.shouldReconnect) {
          console.log('Attempting reconnect in 3s...');
          setTimeout(() => {
            if (this.shouldReconnect) this.connect();
          }, 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WS Connection error:', err);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  }

  flushPendingQueue() {
    while (this.pendingQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msgObj = this.pendingQueue.shift();
      this.ws.send(JSON.stringify(msgObj));
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
      case 'PLAYER_UPDATED':
        this.players = payload.players;
        if (payload.players) {
          const me = payload.players.find((p) => p.id === this.playerId);
          if (me && me.isHost) {
            this.isHost = true;
          }
        }
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

  updateProfile(playerName, playerAvatar) {
    this.sendWhenReady({
      type: 'UPDATE_PROFILE',
      payload: { playerName, playerAvatar }
    });
  }

  sendAction(actionType, stateData = {}, customMessage = '') {
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
      this.pendingQueue.push(msgObj);
      this.connect();
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
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    const prevRoomCode = this.roomCode;
    this.roomCode = null;
    this.playerId = null;
    this.isHost = false;
    this.players = [];
    this.gameState = {};
    this.pendingQueue = [];

    this.notifyListeners({ type: 'ROOM_LEFT', payload: { roomCode: prevRoomCode } });
  }
}

export const wsClient = new WongLaoWebSocketClient();
