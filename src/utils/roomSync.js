// WongLao Room Sync Utility
// Synchronizes game state (Cards, Spin Wheel, Dice) across mobile screens via BroadcastChannel & LocalSync

class RoomSyncManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.channel = null;
    this.listeners = [];
  }

  createRoom() {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.roomCode = code;
    this.isHost = true;
    this.initChannel(code);
    return code;
  }

  joinRoom(code) {
    this.roomCode = code;
    this.isHost = false;
    this.initChannel(code);
  }

  initChannel(code) {
    if (this.channel) {
      this.channel.close();
    }
    this.channel = new BroadcastChannel(`wonglao_room_${code}`);
    this.channel.onmessage = (event) => {
      this.notifyListeners(event.data);
    };

    // Also sync via localStorage storage event for cross-window reliability
    window.addEventListener('storage', (e) => {
      if (e.key === `wonglao_sync_${code}` && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          this.notifyListeners(data);
        } catch (err) {}
      }
    });
  }

  broadcast(type, payload) {
    const message = {
      type,
      payload,
      senderHost: this.isHost,
      timestamp: Date.now()
    };

    if (this.channel) {
      this.channel.postMessage(message);
    }
    if (this.roomCode) {
      try {
        localStorage.setItem(`wonglao_sync_${this.roomCode}`, JSON.stringify(message));
      } catch (e) {}
    }
    return message;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(l => l(data));
  }

  leaveRoom() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.roomCode = null;
    this.isHost = false;
  }
}

export const roomSync = new RoomSyncManager();
