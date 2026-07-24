import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { Redis } from '@upstash/redis';

const PORT = process.env.PORT || 8080;

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
      state: roomData.state,
      updatedAt: Date.now()
    };
    await redis.set(key, JSON.stringify(payload), { ex: 86400 });
  } catch (e) {
    console.warn('Redis sync warning:', e);
  }
}

async function loadRoomFromRedis(code) {
  if (!redis) return null;
  try {
    const key = `wonglao:room:${code}`;
    const raw = await redis.get(key);
    if (raw) {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    }
  } catch (e) {
    console.warn('Redis load error:', e);
  }
  return null;
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

function getRoomStats(room) {
  return Array.isArray(room.state.stats) ? room.state.stats : [];
}

function addStatsForPlayer(room, player, changes = {}) {
  if (!player) return;
  const stats = getRoomStats(room);
  const current = stats.find((item) => item.id === player.id) || {
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    gamesPlayed: 0,
    turns: 0,
    score: 0
  };
  Object.assign(current, { name: player.name, avatar: player.avatar }, changes);
  const next = stats.filter((item) => item.id !== player.id);
  next.push(current);
  room.state.stats = next.sort((a, b) => (b.score || 0) - (a.score || 0) || (b.turns || 0) - (a.turns || 0));
}

wss.on('connection', (ws) => {
  let currentRoomCode = null;
  let playerId = 'player_' + Math.random().toString(36).substring(2, 9);

  ws.on('message', async (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      const { type, payload } = data;

      switch (type) {
        case 'CREATE_ROOM': {
          const code = generateRoomCode();
          currentRoomCode = code;

          const playerObj = {
            id: playerId,
            name: payload.playerName || 'Host เจ้ามือ',
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
              roomPhase: 'lobby',
              activeTab: null,
              stats: [],
              currentCard: null,
              wheelResult: null,
              crocTooth: null,
              diceResult: null
            }
          };

          rooms.set(code, roomData);
          addStatsForPlayer(roomData, playerObj);
          await persistRoomToRedis(code, roomData);

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
          let room = rooms.get(targetCode);

          // If room not in memory, try to recover from Redis
          if (!room && redis) {
            const redisRoom = await loadRoomFromRedis(targetCode);
            if (redisRoom) {
              room = {
                code: targetCode,
                hostId: playerId, // Assign joiner as host if recovered
                players: new Map(),
                state: redisRoom.state || {}
              };
              rooms.set(targetCode, room);
            }
          }

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
          const isFirstPlayer = room.players.size === 0;

          const playerObj = {
            id: playerId,
            name: payload.playerName || `สายตี้ #${room.players.size + 1}`,
            avatar: payload.playerAvatar || '🥳',
            isHost: isFirstPlayer
          };

          if (isFirstPlayer) {
            room.hostId = playerId;
          }

          room.players.set(ws, playerObj);
          addStatsForPlayer(room, playerObj);
          await persistRoomToRedis(targetCode, room);

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
              players: getRoomPlayerList(targetCode),
              stats: getRoomStats(room)
            }
          });
          break;
        }

        case 'GAME_ACTION': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const actor = room.players.get(ws);

          if (payload.actionType === 'SELECT_GAME') {
            if (!actor?.isHost) return;
            room.state = {
              ...room.state,
              roomPhase: 'playing',
              activeTab: payload.activeTab || null,
              stats: getRoomStats(room).map((stat) => ({ ...stat, gamesPlayed: (stat.gamesPlayed || 0) + 1 }))
            };
            room.players.forEach((player) => addStatsForPlayer(room, player));
          } else {
            room.state = { ...room.state, ...payload };
            if (payload.actionType !== 'TAB_CHANGE') {
              const currentStats = getRoomStats(room).find((stat) => stat.id === actor?.id);
              addStatsForPlayer(room, actor, {
                turns: (currentStats?.turns || 0) + 1,
                score: (currentStats?.score || 0) + 1
              });
            }
          }
          await persistRoomToRedis(currentRoomCode, room);

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

        case 'UPDATE_PROFILE': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const playerObj = room.players.get(ws);
          if (playerObj) {
            if (payload.playerName && payload.playerName.trim()) {
              playerObj.name = payload.playerName.trim();
            }
            if (payload.playerAvatar) {
              playerObj.avatar = payload.playerAvatar;
            }
            addStatsForPlayer(room, playerObj);
            await persistRoomToRedis(currentRoomCode, room);

            broadcastToRoom(currentRoomCode, {
              type: 'PLAYER_UPDATED',
              payload: {
                player: playerObj,
                players: getRoomPlayerList(currentRoomCode),
                stats: getRoomStats(room)
              }
            });
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('WS Error processing message:', err);
    }
  });

  ws.on('close', async () => {
    if (currentRoomCode) {
      const room = rooms.get(currentRoomCode);
      if (room) {
        const leavingPlayer = room.players.get(ws);
        const wasHost = leavingPlayer?.isHost;

        room.players.delete(ws);

        if (room.players.size === 0) {
          rooms.delete(currentRoomCode);
        } else {
          // Promote new host if host left
          if (wasHost) {
            const nextEntry = room.players.entries().next().value;
            if (nextEntry) {
              const [, nextPlayer] = nextEntry;
              nextPlayer.isHost = true;
              room.hostId = nextPlayer.id;
            }
          }

          await persistRoomToRedis(currentRoomCode, room);

          broadcastToRoom(currentRoomCode, {
            type: 'PLAYER_LEFT',
            payload: {
              playerId,
              playerName: leavingPlayer?.name,
              players: getRoomPlayerList(currentRoomCode)
            }
          });
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🍻 WongLao WebSocket Server (Host Migration & Redis Recovery Ready) listening on port ${PORT}`);
});
