import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/audio';
import { wsClient } from '../utils/websocket';
import { INTENSITY_LEVELS, INITIAL_DECKS, getCustomDecks } from '../data/decks';
import { fetchAllCardsFromSupabase } from '../utils/supabase';
import { Sparkles, ChevronRight, Lock, Flame, ShieldAlert, Award, Database, Eye, Zap, Hourglass } from 'lucide-react';
import confetti from 'canvas-confetti';

function getIntensityUnitLabel(intensity = 'free') {
  if (intensity === 'spicy') {
    return 'ยก';
  } else if (intensity === 'extreme') {
    return 'กลม';
  } else if (intensity === 'custom') {
    return 'ยก';
  } else {
    return 'จิบ';
  }
}

function cleanPromptText(text = '') {
  return String(text || '')
    .replace(/^(ความกล้า|ความจริง|ฉันไม่เคย|ใครมีโอกาสสุด|Truth|Dare):\s*/i, '');
}

function cleanPenaltyText(text = '', intensity = 'free') {
  const unit = getIntensityUnitLabel(intensity);
  return String(text || '').replace(/(จิบ|ยก|กลม|แก้ว)/g, unit);
}

function getDynamicPenaltyLabel(points = 0) {
  if (points === 0) {
    return { title: 'เอ้ายก! (0 แก้ว)', emoji: '🍻', badge: 'พร้อมดริ้งก์' };
  } else if (points <= 3) {
    return { title: `จัดไป ${points} แก้ว!`, emoji: '🥂', badge: 'เริ่มเครื่องติด' };
  } else if (points <= 7) {
    return { title: `ซดไป ${points} ยก!`, emoji: '🔥', badge: 'เครื่องร้อนตับหวาน' };
  } else if (points <= 12) {
    return { title: `ตบไป ${points} แก้ว!`, emoji: '⚡', badge: 'โหมดตับทองคำ' };
  } else {
    return { title: `ตำนาน ${points} ยก!`, emoji: '👑', badge: 'วงแตกตับทรหด' };
  }
}

function getRandomPenaltyByIntensity() {
  return Math.floor(Math.random() * 5) + 1;
}

function formatRandomPenalty(card, selectedIntensity = 'free') {
  if (!card) return null;
  const targetIntensity = selectedIntensity || card.intensity || 'free';
  if (card._randomizedPenalty && card._intensityLevel === targetIntensity) return card;

  const randomNum = getRandomPenaltyByIntensity();
  const unit = getIntensityUnitLabel(targetIntensity);
  let text = String(card.penalty || '').replace(/(จิบ|ยก|กลม|แก้ว)/g, unit);

  let newPenalty = text;
  if (/ใครเคย/i.test(text)) {
    newPenalty = text.replace(/ใครเคยดื่ม\s*(\d+|หมดแก้ว)?\s*(จิบ|ยก|กลม|แก้ว)!?/gi, `ใครเคยดื่ม ${randomNum} ${unit}`);
  } else if (/คนโดนชี้/i.test(text)) {
    newPenalty = text.replace(/ดื่ม\s*(\d+|หมดแก้ว)?\s*(จิบ|ยก|กลม|แก้ว)!?/gi, `ดื่ม ${randomNum} ${unit}`);
  } else {
    newPenalty = text.replace(/ดื่ม\s*(\d+|หมดแก้ว)?\s*(ยกใหญ่|จิบ|ยก|กลม|แก้ว)!?/gi, `ดื่ม ${randomNum} ${unit}`);
  }

  return {
    ...card,
    penalty: newPenalty,
    _randomizedPenalty: true,
    _intensityLevel: targetIntensity
  };
}

function shuffleArray(array = []) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getPenaltyAmountFromCard(card) {
  if (!card || !card.penalty) return 1;
  const str = String(card.penalty || '');
  const match = str.match(/(\d+)\s*(จิบ|ยก|กลม|แก้ว)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  if (str.includes('หมดแก้ว') || str.includes('หมดกลม')) {
    return 5;
  }
  return 1;
}

export default function CardGame({ isPremiumUnlocked, onOpenPassModal, roomCode, players = [], isHost = false, roomIntensity = 'free' }) {
  const [selectedIntensity, setSelectedIntensity] = useState(roomIntensity);

  useEffect(() => {
    if (roomIntensity) {
      setSelectedIntensity(roomIntensity);
    }
  }, [roomIntensity]);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(wsClient.gameState?.turnIndex || 0);
  const [remoteCard, setRemoteCard] = useState(wsClient.gameState?.syncedCard || null);
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [isPenaltyUsed, setIsPenaltyUsed] = useState(false);
  const [playerPenalties, setPlayerPenalties] = useState({}); // { playerId: { name, avatar, total } }

  // Load and shuffle cards from ALL categories filtered only by intensity
  useEffect(() => {
    async function loadDecks() {
      let combined = [];
      const remoteCards = await fetchAllCardsFromSupabase();

      if (remoteCards && remoteCards.length > 0) {
        setIsDatabaseLoaded(true);
        combined = remoteCards.map((c) => ({
          id: c.id,
          deckType: c.deck_type,
          type: c.type || 'truth',
          intensity: c.intensity,
          prompt: c.prompt,
          penalty: c.penalty
        }));
      } else {
        setIsDatabaseLoaded(false);
        const customDecks = getCustomDecks();
        combined = [...INITIAL_DECKS, ...customDecks];
      }

      // Filter ONLY by intensity (All categories mixed together!)
      const filtered = combined.filter((c) => c.intensity === selectedIntensity);

      const shuffled = shuffleArray(filtered);
      setCards(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsCardRevealed(false);

      // Room Multiplayer Initial Sync
      if (wsClient.roomCode && shuffled.length > 0) {
        if (wsClient.gameState?.syncedCard) {
          setRemoteCard(wsClient.gameState.syncedCard);
        } else if (wsClient.isHost || isHost) {
          const initialCard = formatRandomPenalty(shuffled[0], selectedIntensity);
          setRemoteCard(initialCard);
          wsClient.sendAction(
            'CARD_DRAW',
            { syncedCard: initialCard, turnIndex: 0 },
            `การ์ดใบแรกของวง: ${cleanPromptText(initialCard.prompt)}`
          );
        }
      }
    }

    loadDecks();
  }, [selectedIntensity, roomCode, isHost]);

  // Subscribe to WebSocket Game State Sync
  useEffect(() => {
    const unsubscribe = wsClient.subscribe(({ type, payload }) => {
      if (type === 'SYNC_GAME_STATE') {
        if (payload.actionType === 'CARD_DRAW') {
          if (payload.state?.syncedCard) {
            setRemoteCard(payload.state.syncedCard);
            setIsCardRevealed(false);
            soundManager.playCardFlip();
          }
          if (payload.state?.turnIndex !== undefined) {
            setCurrentTurnIndex(payload.state.turnIndex);
            if (players.length > 0) {
              const nextTurnUser = players[payload.state.turnIndex % players.length];
              if (nextTurnUser && nextTurnUser.id === wsClient.playerId) {
                soundManager.playWheelWin();
              }
            }
          }
        } else if (payload.actionType === 'PENALTY_ADD') {
          if (payload.state?.penaltyPoints !== undefined) {
            setPenaltyPoints(payload.state.penaltyPoints);
            soundManager.playGlassClink();
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
          }
          // Sync per-player scoreboard from the sender's info
          // Skip if we are the sender — local update already happened in handleAddCardPenalty
          if (payload.senderId && payload.addedAmount && payload.senderId !== wsClient.playerId) {
            setPlayerPenalties((prev) => ({
              ...prev,
              [payload.senderId]: {
                name: payload.senderName || 'เพื่อน',
                avatar: payload.senderAvatar || '🍻',
                total: (prev[payload.senderId]?.total || 0) + payload.addedAmount
              }
            }));
          }
        }
      }
    });

    return unsubscribe;
  }, [players]);

  const rawCard = remoteCard || (cards.length > 0 ? cards[currentIndex] : null);
  const currentCard = formatRandomPenalty(rawCard, selectedIntensity);
  const turnPlayer = players.length > 0 ? players[currentTurnIndex % players.length] : null;
  const isMyTurn = turnPlayer && turnPlayer.id === wsClient.playerId;

  const handleNextCard = () => {
    soundManager.playCardFlip();
    setIsFlipped(false);
    setIsCardRevealed(false);
    setIsPenaltyUsed(false);

    let currentDeck = cards;
    let nextCardIdx = currentIndex + 1;

    // Re-shuffle deck when reaching the end for fresh randomness!
    if (nextCardIdx >= currentDeck.length) {
      currentDeck = shuffleArray(currentDeck);
      setCards(currentDeck);
      nextCardIdx = 0;
    }

    const nextTurnIdx = players.length > 0 ? (currentTurnIndex + 1) % players.length : 0;
    const drawnCard = formatRandomPenalty(currentDeck[nextCardIdx] || currentDeck[0], selectedIntensity);

    setCurrentIndex(nextCardIdx);
    setCurrentTurnIndex(nextTurnIdx);
    setRemoteCard(drawnCard);

    if (wsClient.roomCode && drawnCard) {
      const nextTurnUser = players[nextTurnIdx] || { name: 'เพื่อน' };
      wsClient.sendAction(
        'CARD_DRAW',
        {
          syncedCard: drawnCard,
          turnIndex: nextTurnIdx
        },
        `การ์ดใบนี้ของ ${nextTurnUser.name}: ${cleanPromptText(drawnCard.prompt)}`
      );
    }
  };

  const handleIntensityChange = (levelKey) => {
    const levelInfo = Object.values(INTENSITY_LEVELS).find((lvl) => lvl.id === levelKey);
    if (levelInfo && levelInfo.isPremium && !isPremiumUnlocked) {
      soundManager.playClick();
      onOpenPassModal();
    } else {
      soundManager.playClick();
      setSelectedIntensity(levelKey);
    }
  };

  const handleAddCardPenalty = () => {
    if (isPenaltyUsed) return;
    const amount = getPenaltyAmountFromCard(currentCard);
    soundManager.playGlassClink();
    const newPenalty = penaltyPoints + amount;
    setPenaltyPoints(newPenalty);
    setIsPenaltyUsed(true);
    confetti({ particleCount: 30 + amount * 15, spread: 50 + amount * 10, origin: { y: 0.8 } });

    // Track per-player drink score
    const actorId = turnPlayer?.id || wsClient.playerId || 'solo';
    const actorName = turnPlayer?.name || 'คุณ';
    const actorAvatar = turnPlayer?.avatar || '🍻';
    setPlayerPenalties((prev) => ({
      ...prev,
      [actorId]: {
        name: actorName,
        avatar: actorAvatar,
        total: (prev[actorId]?.total || 0) + amount
      }
    }));

    if (wsClient.roomCode && turnPlayer) {
      const unit = getIntensityUnitLabel(selectedIntensity);
      wsClient.sendAction(
        'PENALTY_ADD',
        { penaltyPoints: newPenalty, addedAmount: amount, intensity: selectedIntensity },
        `${turnPlayer.name} โดนบทลงโทษ +${amount} ${unit}! 🍻`
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-4 p-2">
      {/* TURN-BASED MULTIPLAYER ACTIVE BANNER */}
      {roomCode && players.length > 0 && turnPlayer && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
          isMyTurn
            ? 'bg-gradient-to-r from-pink-950 via-purple-950 to-slate-950 border-pink-500 shadow-[0_0_15px_rgba(255,0,122,0.3)]'
            : 'bg-slate-950/90 border-cyan-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-3xl bg-slate-900 p-2 rounded-2xl border border-slate-700 block">{turnPlayer.avatar || '🍻'}</span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                กำลังดูการ์ดของ
              </span>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                <span className={isMyTurn ? "text-pink-400" : "text-cyan-300"}>{turnPlayer.name}</span>
                {!isMyTurn && <span className="text-[10px] text-slate-400 font-semibold">(กำลังตอบ)</span>}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-cyan-400 font-bold block">สุ่มคำถามทุกหมวด</span>
            <span className="text-[11px] text-slate-400 font-semibold">
              {players.length} คนในห้อง
            </span>
          </div>
        </div>
      )}



      {/* Card Display Area with Framer Motion */}
      <div className="relative w-full h-84 perspective-1000">
        <AnimatePresence mode="wait">
          {currentCard ? (
            !isCardRevealed ? (
              <motion.div
                key={(currentCard.id || 'card') + '_' + currentIndex + '_covered'}
                initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                exit={{ rotateY: -90, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  soundManager.playCardFlip();
                  setIsCardRevealed(true);
                }}
                className="w-full h-full rounded-3xl p-6 cursor-pointer select-none flex flex-col justify-between items-center text-center bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 border-2 border-pink-500/80 shadow-[0_0_35px_rgba(255,0,122,0.4)] relative overflow-hidden"
              >
                {/* Card Top Indicator */}
                <div className="w-full flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 border border-pink-500/40 text-pink-400 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>การ์ดสุ่มความลับ 🔒</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>

                {/* Center Turn Content */}
                <div className="my-auto flex flex-col items-center justify-center space-y-3 px-2">
                  <div className="text-4xl bg-slate-900 p-4 rounded-3xl border-2 border-pink-500/50 shadow-[0_0_25px_rgba(255,0,122,0.5)] animate-bounce">
                    {turnPlayer ? turnPlayer.avatar || '🍻' : '🍻'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 drop-shadow">
                      {isMyTurn || !turnPlayer ? '🔥 ถึงตาคุณแล้ว!' : `👀 ถึงตาของ ${turnPlayer.name}`}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">
                      {isMyTurn || !turnPlayer ? 'แตะการ์ดเพื่อเปิดดูคำถามตานี้' : `รอดูคำถามของ ${turnPlayer.name}`}
                    </p>
                  </div>

                  <div className="mt-2 py-2 px-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs shadow-[0_0_15px_rgba(255,0,122,0.6)] animate-pulse flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>✨ แตะเพื่อเปิดคำถาม ✨</span>
                  </div>
                </div>

                {/* Footer Prompt */}
                <div className="text-xs text-slate-500 font-semibold italic">
                  แตะที่ใดก็ได้บนการ์ดเพื่อดูคำถาม
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={(currentCard.id || 'card') + '_' + currentIndex + '_revealed'}
                initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                exit={{ rotateY: -90, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  soundManager.playCardFlip();
                  setIsFlipped(!isFlipped);
                }}
                className={`w-full h-full rounded-3xl p-6 cursor-pointer select-none flex flex-col justify-between border-2 transition-all shadow-[0_0_30px_rgba(255,0,122,0.2)] relative overflow-hidden ${
                  currentCard.type === 'truth'
                    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/80 border-pink-500'
                    : currentCard.type === 'dare'
                    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/80 border-cyan-400'
                    : 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 border-amber-400'
                }`}
              >
                {/* Turn Owner Badge embedded directly on top of Card */}
                {roomCode && turnPlayer && (
                  <div className={`border-b -mx-6 -mt-6 p-3 px-6 mb-2 flex items-center justify-between ${
                    isMyTurn ? 'bg-slate-950/90 border-pink-500/50' : 'bg-slate-950/90 border-slate-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{turnPlayer.avatar || '🍻'}</span>
                      <span className="text-xs font-black text-white">
                        การ์ดของ: <span className={isMyTurn ? 'text-pink-400 font-extrabold' : 'text-cyan-300'}>{turnPlayer.name}</span>
                      </span>
                    </div>
                    {isMyTurn ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-pink-500 text-white animate-pulse">
                        ถึงตาคุณแล้ว!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> รอ {turnPlayer.name} ตอบ...
                      </span>
                    )}
                  </div>
                )}

                {/* Card Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900/80 border border-slate-700 text-white flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>
                      {currentCard.type === 'truth'
                        ? 'ความจริง (Truth)'
                        : currentCard.type === 'dare'
                        ? 'ความกล้า (Dare)'
                        : currentCard.type === 'never'
                        ? 'ฉันไม่เคย...'
                        : 'ใครมีโอกาสสุด'}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>

                {/* Card Content Body - CLEAN PROMPT TEXT */}
                <div className="my-auto text-center px-2 py-2">
                  <p className="text-xl font-bold text-white leading-relaxed tracking-wide">
                    {cleanPromptText(currentCard.prompt)}
                  </p>

                  {currentCard.penalty && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-sm font-semibold text-pink-400 flex items-center justify-center space-x-1">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>บทลงโทษ: {cleanPenaltyText(currentCard.penalty)}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Prompt */}
                <div className="text-center text-xs text-slate-400 font-semibold italic">
                  {roomCode && turnPlayer ? (
                    isMyTurn ? (
                      <span className="text-pink-400 font-bold">👉 ตอบคำถามเสร็จแล้วกด "คนถัดไป"</span>
                    ) : (
                      <span className="text-cyan-300 font-semibold">👀 ทุกจอกำลังดูคำถามของ {turnPlayer.name}...</span>
                    )
                  ) : (
                    'แตะเพื่อพลิกการ์ด / กดปุ่มด้านล่างเพื่อเปลี่ยนใบถัดไป'
                  )}
                </div>
              </motion.div>
            )
          ) : (
            <div className="w-full h-full bg-slate-900/80 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
              <p>ไม่มีการ์ดในหมวดนี้ กรุณาเปลี่ยนระดับ หรือสร้างการ์ด custom!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Actions */}
      {roomCode && players.length > 0 && turnPlayer && !isMyTurn ? (
        <div className="w-full py-4 px-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-center text-xs font-bold text-slate-400 flex items-center justify-center space-x-2 shadow-md">
          <Hourglass className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>⏳ รอคุณ <strong className="text-cyan-300 font-extrabold">{turnPlayer.name}</strong> กำลังตอบอยู่...</span>
        </div>
      ) : (
        <div className="flex space-x-3">
          {(() => {
            const cardAmount = getPenaltyAmountFromCard(currentCard);
            const unit = getIntensityUnitLabel(selectedIntensity);
            // Show THIS player's own accumulated total, not the global shared state
            const actorId = turnPlayer?.id || wsClient.playerId || 'solo';
            const myTotal = playerPenalties[actorId]?.total || 0;
            const penaltyInfo = getDynamicPenaltyLabel(myTotal);
            return (
              <button
                onClick={handleAddCardPenalty}
                disabled={isPenaltyUsed}
                className={`flex-1 py-3.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-950/40 border rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition shadow-[0_0_15px_rgba(245,158,11,0.2)] ${
                  isPenaltyUsed
                    ? 'border-slate-700 text-slate-600 cursor-not-allowed opacity-50'
                    : 'hover:from-amber-500/30 hover:to-amber-900/50 border-amber-500/50 hover:border-amber-400 text-amber-300 active:scale-95'
                }`}
              >
                <span className={`text-base ${isPenaltyUsed ? '' : 'animate-bounce'}`}>
                  {isPenaltyUsed ? '✅' : penaltyInfo.emoji}
                </span>
                <span>
                  {isPenaltyUsed
                    ? `นับแล้ว +${cardAmount} ${unit}`
                    : isCardRevealed
                    ? `+${cardAmount} ${unit} (${myTotal})`
                    : `สะสม${unit} (${myTotal})`}
                </span>
              </button>
            );
          })()}

          <button
            onClick={handleNextCard}
            disabled={!isCardRevealed}
            className={`flex-[2] py-3.5 font-black rounded-2xl text-sm transition flex items-center justify-center space-x-2 ${
              isCardRevealed
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(255,0,122,0.5)] hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isCardRevealed ? (
              <>
                <span>คนถัดไป</span>
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <span className="animate-pulse">🔒</span>
                <span>เปิดการ์ดก่อน</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 🍺 Drink Scoreboard — always visible, shows session totals */}
      {(() => {
        const unit = getIntensityUnitLabel(selectedIntensity);
        // Build list from players array merged with accumulated penalties
        const displayPlayers = players.length > 0
          ? players.map((p) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar || '🍻',
              total: playerPenalties[p.id]?.total || 0
            })).sort((a, b) => b.total - a.total)
          : Object.values(playerPenalties).sort((a, b) => b.total - a.total);

        // In solo mode with no data yet, show an empty placeholder
        if (displayPlayers.length === 0) {
          return (
            <div className="w-full bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-300 tracking-widest uppercase">🏆 สกอร์รอบนี้</span>
                <span className="text-xs text-slate-500">{unit}/คน</span>
              </div>
              <p className="text-center text-slate-600 text-xs py-2">กดสะสมเพื่อเริ่มนับ...</p>
            </div>
          );
        }

        const maxTotal = Math.max(...displayPlayers.map((p) => p.total), 1);
        return (
          <div className="w-full bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-slate-300 tracking-widest uppercase">🏆 สกอร์รอบนี้</span>
              <span className="text-xs text-slate-500">{unit}/คน</span>
            </div>
            {displayPlayers.map((p, i) => {
              const barPct = Math.round((p.total / maxTotal) * 100);
              const medal = i === 0 && p.total > 0 ? '🥇' : i === 1 && p.total > 0 ? '🥈' : i === 2 && p.total > 0 ? '🥉' : '•';
              return (
                <div key={p.id || p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{medal}</span>
                      <span className="text-slate-200 font-bold">{p.avatar} {p.name}</span>
                    </div>
                    <span className={`font-black ${p.total > 0 ? 'text-amber-300' : 'text-slate-600'}`}>
                      {p.total} {unit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${p.total > 0 ? barPct : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
