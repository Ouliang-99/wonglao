import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Crown, Dices, LogIn, Plus, Radio, UserCheck, Users, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundManager } from './utils/audio';
import { wsClient } from './utils/websocket';
import LegalModal from './components/LegalModal';
import RoomModal from './components/RoomModal';
import PartyPassModal from './components/PartyPassModal';
import RoomLobby from './components/RoomLobby';
import StatsModal from './components/StatsModal';

const CardGame = lazy(() => import('./components/CardGame'));
const SpinWheel = lazy(() => import('./components/SpinWheel'));
const FingerChooser = lazy(() => import('./components/FingerChooser'));
const CrocodileDentist = lazy(() => import('./components/CrocodileDentist'));
const DiceRoller = lazy(() => import('./components/DiceRoller'));
const CustomDeckBuilder = lazy(() => import('./components/CustomDeckBuilder'));

export default function App() {
  const [activeTab, setActiveTab] = useState(wsClient.gameState.activeTab || null);
  const [isMuted, setIsMuted] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(() => localStorage.getItem('wonglao_vip_unlocked') === 'true');
  const [connectedPlayers, setConnectedPlayers] = useState(wsClient.players);
  const [roomCode, setRoomCode] = useState(wsClient.roomCode);
  const [isHost, setIsHost] = useState(wsClient.isHost);
  const [stats, setStats] = useState([]);
  const [syncedBanner, setSyncedBanner] = useState('');
  const [homeInputCode, setHomeInputCode] = useState('');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('wonglao_player_name') || '');
  const [playerAvatar, setPlayerAvatar] = useState(() => localStorage.getItem('wonglao_player_avatar') || '🍻');
  const updateProfileTimerRef = useRef(null);

  const shareUrl = useMemo(() => `${window.location.href.split('?')[0].split('#')[0]}?room=${roomCode || ''}`, [roomCode]);

  useEffect(() => {
    const roomParam = new URLSearchParams(window.location.search).get('room');
    if (roomParam) { setHomeInputCode(roomParam); setIsRoomModalOpen(true); }

    return wsClient.subscribe(({ type, payload = {} }) => {
      setIsHost(wsClient.isHost);

      if (type === 'ROOM_CREATED' || type === 'ROOM_JOINED') {
        setRoomCode(payload.roomCode);
        setConnectedPlayers(payload.players || []);
        setStats(payload.gameState?.stats || []);
        setActiveTab(payload.gameState?.activeTab || null);
        setIsRoomModalOpen(false);
        soundManager.playWheelWin();
      } else if (type === 'PLAYER_JOINED' || type === 'PLAYER_UPDATED') {
        setConnectedPlayers(payload.players || []);
        if (payload.stats) setStats(payload.stats);
        if (type === 'PLAYER_JOINED') {
          setSyncedBanner(`🎉 ${payload.player?.name || 'เพื่อน'} เข้าร่วมวงแล้ว!`);
          setTimeout(() => setSyncedBanner(''), 4000);
        } else if (type === 'PLAYER_UPDATED' && payload.player) {
          setSyncedBanner(`✏️ ${payload.player.name} เปลี่ยนชื่อเล่นแล้ว`);
          setTimeout(() => setSyncedBanner(''), 4000);
        }
      } else if (type === 'PLAYER_LEFT') {
        setConnectedPlayers(payload.players || []);
      } else if (type === 'ROOM_LEFT') {
        setRoomCode(null);
        setConnectedPlayers([]);
        setActiveTab(null);
        setStats([]);
        setIsPickerOpen(false);
        setIsHost(false);
      } else if (type === 'SYNC_GAME_STATE') {
        const nextState = payload.state || {};
        if (nextState.activeTab !== undefined) setActiveTab(nextState.activeTab);
        if (nextState.stats) setStats(nextState.stats);
        if (payload.customMessage) {
          setSyncedBanner(`${payload.senderName}: ${payload.customMessage}`);
          setTimeout(() => setSyncedBanner(''), 4000);
        }
      }
    });
  }, []);

  const handleUpdateProfile = (newName, newAvatar) => {
    const nameToSave = newName !== undefined ? newName : playerName;
    const avatarToSave = newAvatar !== undefined ? newAvatar : playerAvatar;
    if (newName !== undefined) setPlayerName(newName);
    if (newAvatar !== undefined) setPlayerAvatar(newAvatar);
    localStorage.setItem('wonglao_player_name', nameToSave);
    localStorage.setItem('wonglao_player_avatar', avatarToSave);

    if (updateProfileTimerRef.current) clearTimeout(updateProfileTimerRef.current);
    updateProfileTimerRef.current = setTimeout(() => {
      if (wsClient.roomCode) {
        wsClient.updateProfile(nameToSave.trim() || 'สายตี้', avatarToSave);
      }
    }, 500);
  };

  const getOrSaveProfile = () => {
    const finalName = playerName.trim() || `สายตี้ #${Math.floor(10 + Math.random() * 90)}`;
    localStorage.setItem('wonglao_player_name', finalName);
    localStorage.setItem('wonglao_player_avatar', playerAvatar);
    if (!playerName.trim()) setPlayerName(finalName);
    return finalName;
  };

  const createRoom = () => {
    soundManager.playClick();
    wsClient.createRoom(getOrSaveProfile(), playerAvatar);
    setIsRoomModalOpen(true);
  };

  const joinRoom = () => {
    if (!homeInputCode.trim()) return setIsRoomModalOpen(true);
    soundManager.playClick();
    wsClient.joinRoom(homeInputCode.trim(), getOrSaveProfile(), playerAvatar);
    setIsRoomModalOpen(true);
  };

  const selectGame = (game) => {
    if (!isHost && !wsClient.isHost) return;
    soundManager.playClick();
    setIsPickerOpen(false);
    wsClient.sendAction('SELECT_GAME', { activeTab: game }, `เริ่มเกม ${game}`);
  };

  const leaveRoom = () => {
    soundManager.playClick();
    wsClient.leaveRoom();
  };

  const soloGame = activeTab || 'dice';

  const renderGame = (game) => (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-cyan-400 font-bold animate-pulse">กำลังโหลดเกม... 🍻</div>}>
      {game === 'cards' && <CardGame isPremiumUnlocked={isPremiumUnlocked} onOpenPassModal={() => setIsPassModalOpen(true)} onSyncCard={(card) => wsClient.sendAction('GAME_EVENT', {}, `จั่วการ์ด: ${card.prompt}`)} />}
      {game === 'wheel' && <SpinWheel onSyncResult={(result) => wsClient.sendAction('GAME_EVENT', {}, result)} />}
      {game === 'finger' && <FingerChooser />}
      {game === 'croc' && <CrocodileDentist onSyncResult={(result) => wsClient.sendAction('GAME_EVENT', {}, result)} />}
      {game === 'dice' && <DiceRoller onSyncResult={(result) => wsClient.roomCode && wsClient.sendAction('GAME_EVENT', {}, result)} />}
      {game === 'custom' && <CustomDeckBuilder />}
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-[#0B0E14] pb-12 text-slate-100 selection:bg-pink-500 selection:text-white relative">
      {/* Top Floating Toast Notification Overlay */}
      {syncedBanner && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm pointer-events-none transition-all duration-300 animate-slideDown">
          <div className="flex items-center justify-center gap-2 border border-cyan-400/60 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold text-cyan-300 shadow-[0_10px_30px_rgba(0,242,254,0.3)]">
            <Radio className="h-4 w-4 text-cyan-400 animate-spin flex-shrink-0" />
            <span className="truncate">{syncedBanner}</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 text-xl">🍻</div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-transparent bg-gradient-to-r from-pink-500 via-cyan-400 to-amber-300 bg-clip-text">วงเหล้า</h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400">
                WongLao Party Hub {roomCode && <span className="text-emerald-400 font-bold">● ห้อง {roomCode} {isHost && '(HOST)'}</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsStatsOpen(true)} className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-2 text-amber-300"><BarChart3 className="h-4 w-4" /></button>
            <button onClick={() => setIsPassModalOpen(true)} className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-2 text-amber-300"><Crown className="h-4 w-4" /></button>
            <button onClick={() => setIsRoomModalOpen(true)} className={`rounded-xl border p-2 ${roomCode ? 'border-emerald-500/60 text-emerald-400' : 'border-slate-800 text-cyan-400'}`}><Users className="h-4 w-4" /></button>
            <button onClick={() => setIsMuted(soundManager.toggleMute())} className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300">{isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 pt-5">
        {!roomCode ? (
          <>
            <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-[0_0_20px_rgba(0,242,254,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" /> โปรไฟล์ของคุณ (ตั้งชื่อเล่น)
                </span>
                <span className="text-[10px] text-slate-500">พิมพ์เปลี่ยนชื่อได้ตลอด</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl bg-slate-950 border border-slate-800 p-2 rounded-2xl flex-shrink-0">{playerAvatar}</span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => handleUpdateProfile(e.target.value, playerAvatar)}
                  placeholder="กรอกชื่อเล่นของคุณ (เช่น พี่เป๊ก สายย่อ)..."
                  maxLength={20}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400 placeholder-slate-600"
                />
              </div>
            </section>
            <section className="rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/40 to-slate-950 p-5">
              <h3 className="text-lg font-black text-white">เกมวนกันเล่น อยู่ในห้อง</h3>
              <p className="mt-1 text-xs text-slate-400">สร้างห้อง → รอเพื่อน → เลือกเกม → เปลี่ยนเกมได้ตลอด</p>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <button onClick={createRoom} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-300 py-3 text-xs font-black text-slate-950 shadow-lg active:scale-95 transition">
                  <Plus className="h-4 w-4" />สร้างห้องใหม่
                </button>
                <button onClick={joinRoom} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 text-xs font-black text-white shadow-lg active:scale-95 transition">
                  <LogIn className="h-4 w-4" />เข้าห้อง
                </button>
              </div>
              <input value={homeInputCode} onChange={(e) => setHomeInputCode(e.target.value)} placeholder="รหัสห้อง 4 หลัก (ถ้ามี)" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-center text-xs text-white outline-none focus:border-pink-400 font-bold" onKeyDown={(e) => e.key === 'Enter' && joinRoom()} />
            </section>
            <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">เล่นคนเดียว</p>
              <h2 className="mt-1 text-2xl font-black text-white">เกมพร้อมเล่นบนเครื่องนี้</h2>
              <p className="mt-1 text-xs text-slate-400">เลือกเล่นเดี่ยวได้ทันที หรือสร้างห้องสำหรับเกมที่ต้องเล่นวนกัน</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => setActiveTab('dice')} className={`rounded-2xl border p-4 text-left ${soloGame === 'dice' ? 'border-amber-400 bg-amber-400/10' : 'border-slate-800 bg-slate-950'}`}>
                  <Dices className="mb-2 h-6 w-6 text-amber-300" />
                  <p className="text-sm font-black">ลูกเต๋า</p>
                  <p className="text-[10px] text-slate-500">เล่นคนเดียวได้</p>
                </button>
                <button onClick={() => setActiveTab('custom')} className={`rounded-2xl border p-4 text-left ${soloGame === 'custom' ? 'border-purple-400 bg-purple-400/10' : 'border-slate-800 bg-slate-950'}`}>
                  <Sparkles className="mb-2 h-6 w-6 text-purple-300" />
                  <p className="text-sm font-black">สร้างเด็ค</p>
                  <p className="text-[10px] text-slate-500">เตรียมเกมของวง</p>
                </button>
              </div>
            </section>
            {renderGame(soloGame)}
          </>
        ) : activeTab && !isPickerOpen ? (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-emerald-300">กำลังเล่นกับ {connectedPlayers.length} คน</p>
                <p className="text-[10px] text-slate-400">
                  {isHost ? 'คุณเป็น Host เปลี่ยนเกมได้ทุกเมื่อ' : 'รอ Host เปลี่ยนเกม หรือเล่นเกมปัจจุบัน'}
                </p>
              </div>
              {isHost && (
                <button onClick={() => setIsPickerOpen(true)} className="rounded-xl border border-cyan-400/40 bg-cyan-950 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900 transition">
                  เปลี่ยนเกม
                </button>
              )}
            </div>
            {renderGame(activeTab)}
          </>
        ) : (
          <RoomLobby
            roomCode={roomCode}
            players={connectedPlayers}
            isHost={isHost}
            activeGame={activeTab}
            stats={stats}
            shareUrl={shareUrl}
            playerName={playerName}
            playerAvatar={playerAvatar}
            onUpdateProfile={handleUpdateProfile}
            onSelectGame={selectGame}
            onOpenStats={() => setIsStatsOpen(true)}
            onCopyRoom={() => navigator.clipboard.writeText(shareUrl)}
            onLeave={leaveRoom}
          />
        )}
      </main>

      <footer className="mt-8 text-center text-[10px] text-slate-600">© 2026 WongLao Party Hub · Age 18+</footer>

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
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} stats={stats} />
      <PartyPassModal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} onUnlock={() => { localStorage.setItem('wonglao_vip_unlocked', 'true'); setIsPremiumUnlocked(true); }} />
    </div>
  );
}
