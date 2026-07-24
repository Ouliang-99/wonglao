import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { soundManager } from './utils/audio';
import { wsClient } from './utils/websocket';
import LegalModal from './components/LegalModal';
import RoomModal from './components/RoomModal';
import PartyPassModal from './components/PartyPassModal';
import {
  Beer,
  Volume2,
  VolumeX,
  Users,
  Crown,
  Dices,
  RotateCw,
  Fingerprint,
  Smile,
  Sparkles,
  Layers,
  Shield,
  Plus,
  LogIn,
  QrCode,
  Radio
} from 'lucide-react';

const CardGame = lazy(() => import('./components/CardGame'));
const SpinWheel = lazy(() => import('./components/SpinWheel'));
const FingerChooser = lazy(() => import('./components/FingerChooser'));
const CrocodileDentist = lazy(() => import('./components/CrocodileDentist'));
const DiceRoller = lazy(() => import('./components/DiceRoller'));
const CustomDeckBuilder = lazy(() => import('./components/CustomDeckBuilder'));

const AVATARS = ['🍻', '🦊', '🐲', '👑', '🍹', '🐯', '🔥', '🥳', '😎', '💃'];

export default function App() {
  const [activeTab, setActiveTab] = useState('cards');
  const [isMuted, setIsMuted] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(() => {
    return localStorage.getItem('wonglao_vip_unlocked') === 'true';
  });
  const [syncedBanner, setSyncedBanner] = useState('');
  const [connectedPlayers, setConnectedPlayers] = useState(wsClient.players);
  const [roomCode, setRoomCode] = useState(wsClient.roomCode);

  const [homeInputCode, setHomeInputCode] = useState('');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('wonglao_player_name') || '');
  const [playerAvatar, setPlayerAvatar] = useState(() => localStorage.getItem('wonglao_player_avatar') || '🍻');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setHomeInputCode(roomParam);
      setIsRoomModalOpen(true);
    }

    const unsubscribe = wsClient.subscribe((event) => {
      const { type, payload } = event;

      if (type === 'ROOM_CREATED' || type === 'ROOM_JOINED') {
        setRoomCode(payload.roomCode);
        setConnectedPlayers(payload.players);
        soundManager.playWheelWin();
      } else if (type === 'PLAYER_JOINED') {
        setConnectedPlayers(payload.players);
        setSyncedBanner(`🎉 ${payload.player.name} เข้าร่วมวงเหล้าแล้ว!`);
        soundManager.playClick();
        setTimeout(() => setSyncedBanner(''), 4000);
      } else if (type === 'PLAYER_LEFT') {
        setConnectedPlayers(payload.players);
      } else if (type === 'ROOM_LEFT') {
        setRoomCode(null);
        setConnectedPlayers([]);
        setSyncedBanner('ออกจากห้องเรียบร้อย');
        setTimeout(() => setSyncedBanner(''), 3000);
      } else if (type === 'SYNC_GAME_STATE') {
        if (payload.state.activeTab && payload.state.activeTab !== activeTab) {
          setActiveTab(payload.state.activeTab);
        }
        if (payload.customMessage) {
          setSyncedBanner(`${payload.senderName}: ${payload.customMessage}`);
          soundManager.playSpinTick();
          setTimeout(() => setSyncedBanner(''), 5000);
        }
      }
    });

    return unsubscribe;
  }, [activeTab]);

  const getOrSaveProfile = () => {
    const finalName = playerName.trim() || `สายตี้ #${Math.floor(10 + Math.random() * 90)}`;
    localStorage.setItem('wonglao_player_name', finalName);
    localStorage.setItem('wonglao_player_avatar', playerAvatar);
    if (!playerName.trim()) setPlayerName(finalName);
    return finalName;
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleUnlockVIP = () => {
    localStorage.setItem('wonglao_vip_unlocked', 'true');
    setIsPremiumUnlocked(true);
  };

  const handleTabChange = (tabKey) => {
    soundManager.playClick();
    setActiveTab(tabKey);
    if (wsClient.roomCode) {
      wsClient.sendAction('TAB_CHANGE', { activeTab: tabKey }, `เปลี่ยนไปโหมด ${tabKey}`);
    }
  };

  const handleGameActionBroadcast = useCallback((message) => {
    if (wsClient.roomCode) {
      wsClient.sendAction('GAME_EVENT', {}, message);
    }
  }, []);

  const handleQuickCreateRoom = () => {
    soundManager.playClick();
    const finalName = getOrSaveProfile();
    wsClient.createRoom(finalName, playerAvatar);
    setIsRoomModalOpen(true);
  };

  const handleQuickJoinRoom = () => {
    if (!homeInputCode.trim()) {
      setIsRoomModalOpen(true);
      return;
    }
    soundManager.playClick();
    const finalName = getOrSaveProfile();
    wsClient.joinRoom(homeInputCode.trim(), finalName, playerAvatar);
    setIsRoomModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-between pb-12 selection:bg-pink-500 selection:text-white">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(255,0,122,0.6)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🍻
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-amber-300">
                วงเหล้า
              </h1>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest -mt-1 flex items-center space-x-1">
                <span>WongLao Party Hub</span>
                {roomCode && <span className="text-emerald-400 font-bold ml-1">● WebSocket Live</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { soundManager.playClick(); setIsPassModalOpen(true); }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition ${
                isPremiumUnlocked
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_10px_rgba(255,215,0,0.5)] active:scale-95'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">{isPremiumUnlocked ? 'VIP Active' : 'Pass 39฿'}</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); setIsRoomModalOpen(true); }}
              className={`p-2 border rounded-xl transition relative flex items-center space-x-1 ${
                roomCode
                  ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-400 shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
              }`}
            >
              <Users className="w-4 h-4" />
              {roomCode && <span className="text-[11px] font-bold">{connectedPlayers.length}</span>}
              {roomCode && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={toggleSound}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      {syncedBanner && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-pink-950 border-b border-cyan-500/50 p-2.5 text-center text-xs font-bold text-cyan-300 animate-pulse flex items-center justify-center space-x-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{syncedBanner}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 pt-3 flex-1 space-y-4">
        {/* ROOM BANNER CARD */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 rounded-3xl border border-slate-800 shadow-[0_0_30px_rgba(0,242,254,0.15)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔥</span>
              <div>
                <h3 className="text-sm font-black text-white">ห้องเล่นกับเพื่อน (Multiplayer)</h3>
                <p className="text-[11px] text-slate-400">
                  {roomCode ? `เชื่อมต่อห้อง ${roomCode} เรียบร้อย` : 'เล่นบนจอมือถือตัวเอง Sync พร้อมกันทั้งวง'}
                </p>
              </div>
            </div>

            {roomCode && (
              <button
                onClick={() => setIsRoomModalOpen(true)}
                className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-400 flex items-center space-x-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            )}
          </div>

          <div className="flex space-x-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => {
                const nextAvIdx = (AVATARS.indexOf(playerAvatar) + 1) % AVATARS.length;
                const newAv = AVATARS[nextAvIdx];
                setPlayerAvatar(newAv);
                localStorage.setItem('wonglao_player_avatar', newAv);
              }}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-lg flex items-center justify-center flex-shrink-0 active:scale-95 transition"
              title="แตะเพื่อเปลี่ยนอวตาร"
            >
              {playerAvatar}
            </button>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                localStorage.setItem('wonglao_player_name', e.target.value);
              }}
              placeholder="ใส่ชื่อเล่นในวง (ไม่ใส่ = สุ่มชื่อให้อัตโนมัติ)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {roomCode ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div className="text-xs">
                  <span className="font-bold text-white block">กำลังอยู่ในห้อง: {roomCode}</span>
                  <span className="text-slate-400 text-[10px]">สมาชิก {connectedPlayers.length} เครื่อง</span>
                </div>
              </div>
              <button
                onClick={() => setIsRoomModalOpen(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl text-xs font-bold border border-slate-700"
              >
                ดูสมาชิก
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleQuickCreateRoom}
                className="py-3 bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-black rounded-2xl text-xs shadow-md hover:shadow-[0_0_15px_#00F2FE] active:scale-95 transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>สร้างห้องตี้ใหม่</span>
              </button>

              <div className="flex space-x-1">
                <input
                  type="text"
                  value={homeInputCode}
                  onChange={(e) => setHomeInputCode(e.target.value)}
                  placeholder="รหัส 4 หลัก"
                  className="w-20 bg-slate-950 border border-slate-700 rounded-2xl px-2 text-center text-xs text-white font-bold focus:outline-none focus:border-pink-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickJoinRoom()}
                />
                <button
                  onClick={handleQuickJoinRoom}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-2xl text-xs shadow-md hover:shadow-[0_0_15px_#FF007A] active:scale-95 transition flex items-center justify-center space-x-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าห้อง</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => handleTabChange('cards')}
            className={`py-2 rounded-xl flex flex-col items-center justify-center transition ${
              activeTab === 'cards'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span>การ์ด</span>
          </button>

          <button
            onClick={() => handleTabChange('wheel')}
            className={`py-2 rounded-xl flex flex-col items-center justify-center transition ${
              activeTab === 'wheel'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-4 h-4 mb-0.5" />
            <span>วงล้อ</span>
          </button>

          <button
            onClick={() => handleTabChange('finger')}
            className={`py-2 rounded-xl flex flex-col items-center justify-center transition ${
              activeTab === 'finger'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4 mb-0.5" />
            <span>จับนิ้ว</span>
          </button>

          <button
            onClick={() => handleTabChange('croc')}
            className={`py-2 rounded-xl flex flex-col items-center justify-center transition ${
              activeTab === 'croc'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-4 h-4 mb-0.5" />
            <span>จระเข้</span>
          </button>

          <button
            onClick={() => handleTabChange('dice')}
            className={`py-2 rounded-xl flex flex-col items-center justify-center transition ${
              activeTab === 'dice'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="w-4 h-4 mb-0.5" />
            <span>ลูกเต๋า</span>
          </button>

          <button
            onClick={() => handleTabChange('custom')}
            className={`py-2 rounded-xl flex flex-col items-center justify-center transition ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>Custom</span>
          </button>
        </div>

        {/* Tab Views with Suspense */}
        <Suspense fallback={
          <div className="w-full h-64 flex items-center justify-center text-cyan-400 text-sm font-bold animate-pulse">
            กำลังโหลดเกม... 🍻
          </div>
        }>
          {activeTab === 'cards' && (
            <CardGame
              isPremiumUnlocked={isPremiumUnlocked}
              onOpenPassModal={() => setIsPassModalOpen(true)}
              onSyncCard={(card) => handleGameActionBroadcast(`จั่วการ์ด: ${card.prompt}`)}
            />
          )}

          {activeTab === 'wheel' && (
            <SpinWheel onSyncResult={(res) => handleGameActionBroadcast(res)} />
          )}

          {activeTab === 'finger' && <FingerChooser />}

          {activeTab === 'croc' && (
            <CrocodileDentist onSyncResult={(res) => handleGameActionBroadcast(res)} />
          )}

          {activeTab === 'dice' && (
            <DiceRoller onSyncResult={(res) => handleGameActionBroadcast(res)} />
          )}

          {activeTab === 'custom' && <CustomDeckBuilder />}
        </Suspense>
      </main>

      <footer className="mt-8 text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>เมาไม่ขับ • มีสิทธิ์ปฏิเสธภารกิจได้หากไม่ปลอดภัย • Age 18+</span>
        </div>
        <p className="text-[10px] text-slate-600">
          © 2026 WongLao Party Hub | wonglao.app
        </p>
      </footer>

      <LegalModal />
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        initialRoomCode={homeInputCode}
        playerName={playerName}
        setPlayerName={setPlayerName}
        playerAvatar={playerAvatar}
        setPlayerAvatar={setPlayerAvatar}
      />
      <PartyPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onUnlock={handleUnlockVIP}
      />
    </div>
  );
}
