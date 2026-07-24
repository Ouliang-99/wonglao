import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const PORT = process.env.PORT || 8080;
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

          rooms.set(code, {
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
          });

          ws.send(
            JSON.stringify({
              type: 'ROOM_CREATED',
              payload: {
                roomCode: code,
                playerId,
                players: getRoomPlayerList(code),
                gameState: rooms.get(code).state
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

          // Confirm joining to this player
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

          // Notify everyone in room about new player joining
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

          // Merge room state
          room.state = { ...room.state, ...payload };

          // Broadcast state update to ALL screens in the room
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

        case 'BUZZ_PLAYER': {
          if (!currentRoomCode) return;
          broadcastToRoom(currentRoomCode, {
            type: 'PLAYER_BUZZED',
            payload: {
              fromPlayer: room.players.get(ws)?.name || 'เพื่อนในวง',
              targetPlayerId: payload.targetPlayerId,
              message: payload.message || 'ชนแก้ว! 🍻'
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
  console.log(`🍻 WongLao WebSocket Server listening on port ${PORT}`);
});
