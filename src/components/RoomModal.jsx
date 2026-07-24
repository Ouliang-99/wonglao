import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { wsClient } from '../utils/websocket';
import { soundManager } from '../utils/audio';
import { X, Users, QrCode, LogOut, Copy, Check, UserCheck } from 'lucide-react';

const AVATARS = ['🍻', '🦊', '🐲', '👑', '🍹', '🐯', '🔥', '🥳', '😎', '💃'];

export default function RoomModal({
  isOpen,
  onClose,
  initialRoomCode = '',
  playerName = '',
  setPlayerName,
  playerAvatar = '🍻',
  setPlayerAvatar
}) {
  const [roomCode, setRoomCode] = useState(wsClient.roomCode);
  const [inputCode, setInputCode] = useState(initialRoomCode);
  const [players, setPlayers] = useState(wsClient.players);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialRoomCode) {
      setInputCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  useEffect(() => {
    const unsubscribe = wsClient.subscribe((event) => {
      const { type, payload } = event;
      if (type === 'ROOM_CREATED' || type === 'ROOM_JOINED') {
        setRoomCode(payload.roomCode);
        setPlayers(payload.players);
        setErrorMsg('');
      } else if (type === 'PLAYER_JOINED' || type === 'PLAYER_LEFT') {
        setPlayers(payload.players);
      } else if (type === 'ROOM_LEFT') {
        setRoomCode(null);
        setPlayers([]);
      } else if (type === 'ERROR') {
        setErrorMsg(payload.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const saveProfile = () => {
    const finalName = playerName.trim() || `สายตี้ #${Math.floor(10 + Math.random() * 90)}`;
    localStorage.setItem('wonglao_player_name', finalName);
    localStorage.setItem('wonglao_player_avatar', playerAvatar);
    if (!playerName.trim() && setPlayerName) {
      setPlayerName(finalName);
    }
    return finalName;
  };

  const handleCreate = () => {
    soundManager.playClick();
    const finalName = saveProfile();
    wsClient.createRoom(finalName, playerAvatar);
  };

  const handleJoin = () => {
    if (!inputCode.trim()) return;
    soundManager.playClick();
    const finalName = saveProfile();
    wsClient.joinRoom(inputCode.trim(), finalName, playerAvatar);
  };

  const handleLeave = () => {
    soundManager.playClick();
    wsClient.leaveRoom();
    setRoomCode(null);
    setPlayers([]);
  };

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPath = window.location.href.split('?')[0].split('#')[0];
  const shareUrl = roomCode ? `${currentPath}?room=${roomCode}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-[0_0_50px_rgba(0,242,254,0.25)] space-y-5 animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white">ห้องเล่นร่วมกัน (WebSocket Real-Time)</h2>
          <p className="text-xs text-slate-400 mt-1">
            เชื่อมต่อหน้าจอมือถือเพื่อนทุกคนในวง Real-Time จอใครจอมัน!
          </p>
        </div>

        {/* Compact Single Profile Pill */}
        {!roomCode && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{playerAvatar}</span>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">โปรไฟล์ของคุณ</span>
                <span className="text-sm font-bold text-white">
                  {playerName.trim() || 'สายตี้ (สุ่มชื่อ)'}
                </span>
              </div>
            </div>
            <div className="flex space-x-1">
              {AVATARS.slice(0, 4).map((av) => (
                <button
                  key={av}
                  onClick={() => setPlayerAvatar(av)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border ${
                    playerAvatar === av ? 'border-cyan-400 bg-cyan-950/50' : 'border-slate-800 bg-slate-900 opacity-60'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Room Active View */}
        {roomCode ? (
          <div className="flex flex-col items-center space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                รหัสห้องเล่น (WebSocket Live Room Code)
              </span>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-300 tracking-wider">
                  {roomCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-300"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <QRCodeSVG value={shareUrl} size={140} />
            </div>

            <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>WebSocket Sync Live จอใครจอมัน! ({players.length} คนในห้อง)</span>
            </p>

            {/* Players List in Room */}
            <div className="w-full bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>สมาชิกในวงที่เชื่อมต่อ</span>
                <span className="text-cyan-400">{players.length} เครื่อง</span>
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-slate-950 p-2 rounded-lg text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{p.avatar || '🍻'}</span>
                      <span className="font-semibold text-white">{p.name}</span>
                      {p.isHost && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-950">
                          HOST
                        </span>
                      )}
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLeave}
              className="w-full py-2.5 bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-600 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากห้อง</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 bg-red-950/80 border border-red-500 rounded-xl text-xs text-red-300 text-center font-bold">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleCreate}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-black rounded-2xl text-sm shadow-md hover:shadow-[0_0_20px_rgba(0,242,254,0.5)] active:scale-95 transition flex items-center justify-center space-x-2"
            >
              <QrCode className="w-5 h-5" />
              <span>สร้างห้องเป็น Host ทันที</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase font-bold">หรือ</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="กรอกรหัสห้อง 4 หลัก..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-center font-bold tracking-wider"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                เข้าร่วมห้อง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
