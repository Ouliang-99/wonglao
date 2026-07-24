import React from 'react';
import { BarChart3, Check, Copy, Gamepad2, LogOut, Play, UserCheck, Users } from 'lucide-react';

export const PARTY_GAMES = [
  { id: 'cards', label: 'การ์ดวงเหล้า', description: 'ผลัดกันตอบคำถามและทำภารกิจ', emoji: '🃏', color: 'from-pink-500 to-rose-600' },
  { id: 'wheel', label: 'วงล้อสุ่ม', description: 'สุ่มผู้เล่นหรือบทลงโทษ', emoji: '🎡', color: 'from-cyan-500 to-teal-400' },
  { id: 'finger', label: 'จับนิ้ว', description: 'วางนิ้วแล้วสุ่มคนโดน', emoji: '💣', color: 'from-fuchsia-500 to-purple-600' },
  { id: 'croc', label: 'จระเข้เขี้ยว', description: 'กดฟัน ใครโดนก่อนแพ้', emoji: '🐊', color: 'from-emerald-500 to-teal-400' }
];

export default function RoomLobby({
  roomCode,
  players,
  isHost,
  activeGame,
  stats = [],
  shareUrl,
  playerName = '',
  playerAvatar = '🍻',
  onUpdateProfile,
  onSelectGame,
  onOpenStats,
  onCopyRoom,
  onLeave
}) {
  const selected = PARTY_GAMES.find((game) => game.id === activeGame);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 p-5 shadow-[0_0_30px_rgba(0,242,254,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">ห้องปาร์ตี้</p>
            <h2 className="mt-1 text-2xl font-black text-white">ห้อง {roomCode}</h2>
            <p className="mt-1 text-xs text-slate-400">แชร์ลิงก์ให้เพื่อนเข้าห้อง แล้วเริ่มเล่นพร้อมกัน</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onOpenStats} className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-2 text-amber-300" title="สถิติและอันดับ">
              <BarChart3 className="h-4 w-4" />
            </button>
            <button onClick={onLeave} className="rounded-xl border border-red-400/30 bg-red-400/10 p-2 text-red-300" title="ออกจากห้อง">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* User Profile Quick Edit */}
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 p-2.5">
          <span className="text-xl bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex-shrink-0">{playerAvatar}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> เปลี่ยนชื่อเล่นของคุณ
              </span>
              <span className="text-[9px] text-slate-500">พิมพ์เปลี่ยนชื่อได้ทันที</span>
            </div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => onUpdateProfile && onUpdateProfile(e.target.value, playerAvatar)}
              placeholder="กรอกชื่อเล่นของคุณ..."
              maxLength={20}
              className="w-full bg-transparent text-xs font-bold text-white focus:outline-none focus:text-cyan-400 placeholder-slate-600 mt-0.5"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-300"><Users className="h-4 w-4 text-emerald-400" /> สมาชิก {players.length} คน</div>
          <button onClick={onCopyRoom} className="flex items-center gap-1 rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-black text-slate-950"><Copy className="h-3.5 w-3.5" /> คัดลอกลิงก์</button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <span className="text-lg">{player.avatar}</span>
              <span className="min-w-0 truncate text-xs font-bold text-white">{player.name}</span>
              {player.isHost && <span className="ml-auto text-[10px] text-amber-300 font-bold">HOST</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div><h3 className="font-black text-white">{selected ? `กำลังเล่น: ${selected.label}` : 'เลือกเกมที่จะเล่น'}</h3><p className="text-[11px] text-slate-500">{isHost ? 'Host เปลี่ยนเกมได้ทุกเมื่อ สมาชิกทุกคนจะเปลี่ยนตาม' : 'รอ Host เลือกเกมให้ทั้งวง'}</p></div>
          <Gamepad2 className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PARTY_GAMES.map((game) => {
            const isSelected = activeGame === game.id;
            return <button key={game.id} disabled={!isHost} onClick={() => onSelectGame(game.id)} className={`rounded-2xl border p-3 text-left transition ${isSelected ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-800 bg-slate-900/60'} ${!isHost ? 'cursor-default opacity-80' : 'hover:border-cyan-400/70 active:scale-95'}`}>
              <div className="flex items-center justify-between"><span className="text-2xl">{game.emoji}</span>{isSelected ? <Check className="h-4 w-4 text-emerald-400" /> : isHost && <Play className="h-4 w-4 text-slate-500" />}</div>
              <p className="mt-2 text-xs font-black text-white">{game.label}</p><p className="mt-0.5 text-[10px] text-slate-500">{game.description}</p>
            </button>;
          })}
        </div>
      </div>

      {stats.length > 0 && <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-4"><div className="flex items-center justify-between"><h3 className="font-black text-amber-200">อันดับในห้อง</h3><button onClick={onOpenStats} className="text-xs font-bold text-amber-300">ดูทั้งหมด</button></div><div className="mt-2 space-y-2">{stats.slice(0, 3).map((stat, index) => <div key={stat.id} className="flex items-center gap-2 text-xs"><span className="w-5 text-center text-amber-300">#{index + 1}</span><span className="flex-1 truncate text-slate-200">{stat.name}</span><span className="font-bold text-cyan-300">{stat.turns || 0} รอบ</span></div>)}</div></div>}
      {shareUrl && <input readOnly value={shareUrl} className="sr-only" aria-label="ลิงก์เข้าห้อง" />}
    </section>
  );
}
