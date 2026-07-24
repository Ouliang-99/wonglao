import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { Redis } from '@upstash/redis';

const PORT = process.env.PORT || 8080;

// Upstash Redis Client (optional if env vars set)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
  : null;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🍻 WongLao Party Hub WebSocket Server is Running!');
});

const wss = new WebSocketServer({ server });

// Memory Rooms Store
// roomCode -> { code, hostId, players: Map<ws, { id, name, avatar, isHost }>, state: {} }
const rooms = new Map();

function generateRoomCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

async function persistRoomToRedis(code, roomData) {
  if (!redis) return;
  try {
    const key = `wonglao:room:${code}`;
    const payload = {
      code,
      hostId: roomData.hostId,
      playerCount: roomData.players.size,
      state: roomData.state,
      updatedAt: Date.now()
    };
    await redis.set(key, JSON.stringify(payload), { ex: 86400 }); // Auto expire after 24 hours
  } catch (e) {
    console.warn('Redis sync warning:', e);
  }
}

function broadcastToRoom(roomCode, data, excludeWs = null) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const payload = JSON.stringify(data);
  room.players.forEach((player, clientWs) => {
    if (clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(payload);
    }
  });
}

function getRoomPlayerList(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  const list = [];
  room.players.forEach((player) => {
    list.push({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      isHost: player.isHost
    });
  });
  return list;
}

wss.on('connection', (ws) => {
  let currentRoomCode = null;
  let playerId = 'player_' + Math.random().toString(36).substring(2, 9);

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      const { type, payload } = data;

      switch (type) {
        case 'CREATE_ROOM': {
          const code = generateRoomCode();
          currentRoomCode = code;

          const playerObj = {
            id: playerId,
            name: payload.playerName || 'Host',
            avatar: payload.playerAvatar || '🍻',
            isHost: true
          };

          const playersMap = new Map();
          playersMap.set(ws, playerObj);

          const roomData = {
            code,
            hostId: playerId,
            players: playersMap,
            state: {
              activeTab: 'cards',
              currentCard: null,
              wheelResult: null,
              crocTooth: null,
              diceResult: null
            }
          };

          rooms.set(code, roomData);
          persistRoomToRedis(code, roomData);

          ws.send(
            JSON.stringify({
              type: 'ROOM_CREATED',
              payload: {
                roomCode: code,
                playerId,
                players: getRoomPlayerList(code),
                gameState: roomData.state
              }
            })
          );
          break;
        }

        case 'JOIN_ROOM': {
          const targetCode = payload.roomCode?.toString().trim();
          const room = rooms.get(targetCode);

          if (!room) {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'ไม่พบรหัสห้องนี้ กรุณาตรวจสอบอีกครั้ง' }
              })
            );
            return;
          }

          currentRoomCode = targetCode;
          const playerObj = {
            id: playerId,
            name: payload.playerName || `สายตี้ #${room.players.size + 1}`,
            avatar: payload.playerAvatar || '🥳',
            isHost: false
          };

          room.players.set(ws, playerObj);
          persistRoomToRedis(targetCode, room);

          ws.send(
            JSON.stringify({
              type: 'ROOM_JOINED',
              payload: {
                roomCode: targetCode,
                playerId,
                players: getRoomPlayerList(targetCode),
                gameState: room.state
              }
            })
          );

          broadcastToRoom(targetCode, {
            type: 'PLAYER_JOINED',
            payload: {
              player: playerObj,
              players: getRoomPlayerList(targetCode)
            }
          });
          break;
        }

        case 'GAME_ACTION': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          room.state = { ...room.state, ...payload };
          persistRoomToRedis(currentRoomCode, room);

          broadcastToRoom(currentRoomCode, {
            type: 'SYNC_GAME_STATE',
            payload: {
              senderId: playerId,
              senderName: room.players.get(ws)?.name || 'เพื่อนในวง',
              actionType: payload.actionType,
              state: room.state,
              customMessage: payload.customMessage
            }
          });
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('WS Error processing message:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomCode) {
      const room = rooms.get(currentRoomCode);
      if (room) {
        const playerObj = room.players.get(ws);
        room.players.delete(ws);

        if (room.players.size === 0) {
          rooms.delete(currentRoomCode);
        } else {
          broadcastToRoom(currentRoomCode, {
            type: 'PLAYER_LEFT',
            payload: {
              playerId,
              playerName: playerObj?.name,
              players: getRoomPlayerList(currentRoomCode)
            }
          });
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🍻 WongLao WebSocket Server (Redis Ready) listening on port ${PORT}`);
});
