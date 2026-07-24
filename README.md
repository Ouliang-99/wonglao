# 🍻 วงเหล้า (WongLao Party Hub)

> **เกมปาร์ตี้วงเหล้าภาษาไทย เล่นบนเว็บได้ทันที ไม่ต้องโหลดแอป**
> Web Application / PWA / Real-Time WebSocket Multi-Device Party Game

---

## 🌟 ฟีเจอร์หลัก (Core Features)

### 🃏 โหมดการ์ดเกม (Card Decks)
- ความจริงหรือความกล้า (Truth or Dare)
- ฉันไม่เคย (Never Have I Ever)
- ใครมีโอกาสสุด (Most Likely To)
- โหลดจาก Supabase ได้แบบ Real-time + รองรับ Custom Deck

### 🔥 ระดับความห้าว (Intensity Levels)
เลือกที่ **Lobby ก่อนเข้าเกม** ใช้เป็นค่าตั้งต้นให้ทุกเกมในห้อง:

| ระดับ | ชื่อ | หน่วย | ความห้าว |
|-------|------|--------|----------|
| Lv.1–3 | 🍺 จิบ | **จิบ** | เบาๆ กระชับมิตร |
| Lv.4–7 | 🍻 แก้ว | **ยก** | เริ่มมันแล้ว |
| Lv.8–10 | 🍾 กลม | **กลม** | วงแตกชัวร์ |
| VIP | 👑 Custom | **ยก** | ออกแบบเองได้ |

บทลงโทษจะแสดงหน่วย (จิบ / ยก / กลม) ตามระดับที่เลือกโดยอัตโนมัติ

### 🎮 มินิเกม
- 🎡 วงล้อสุ่มลงโทษ (Spin the Wheel)
- 💣 สุ่มจับนิ้ว (Finger Chooser / Bomb)
- 🐊 จระเข้งับนิ้ว (Crocodile Dentist)
- 🎲 ทอยลูกเต๋านีออน (Neon Dice Roller)

### 🔌 Real-Time WebSocket Room ("จอใครจอมัน")
- สร้างห้อง / เข้าร่วมห้องด้วยรหัส 4 หลัก หรือสแกน QR Code
- ซิงค์การ์ดและผลสุ่มเปลี่ยนพร้อมกัน real-time บนหน้าจอมือถือทุกคน
- ระบบ Turn-Based: รู้ว่าตอนนี้คิวใคร มีตัวนับเวลารอ
- Host ควบคุม: เลือกเกม, เปลี่ยนระดับความห้าว, เปลี่ยนเกมได้ตลอด
- สถิติรอบเกม: นับแยกว่ากินกี่ จิบ / แก้ว / กลม / VIP

### 📊 สถิติ & สกอร์บอร์ด
- **สกอร์บอร์ดรอบนี้**: แสดงสดในเกม เห็นว่าใครกินเยอะสุด พร้อม progress bar
- **สถิติรวม**: ดูหลังเกม แยกรายละเอียดตามระดับ 🍺🍻🍾👑
- นับสถิติถูกต้อง: เพิ่มเฉพาะเมื่อกดสะสมจริง ไม่นับ config change

### ✍️ Custom Deck Builder
สร้างคำถามและบทลงโทษเฉพาะกลุ่มเพื่อนได้เอง

### 🔊 Web Audio API Sound Synthesizer
เสียงเอฟเฟกต์ 100% Offline ไม่ต้องพึ่งไฟล์ mp3 ภายนอก

---

## 🆕 อัปเดตล่าสุด

- **ระดับความห้าวกลาง Lobby**: Host เลือกระดับก่อนเข้าเกม ใช้กับทุกเกมในห้อง
- **หน่วยบทลงโทษ Dynamic**: จิบ/ยก/กลม เปลี่ยนตามโหมดที่เลือก
- **สกอร์บอร์ดรอบนี้**: แสดงแบบ real-time ทุกหน้าจอตรงกัน
- **ปุ่มสะสม Disable หลังกด**: ป้องกันกดซ้ำ แสดง ✅ นับแล้ว
- **ล็อกปุ่มคนถัดไป**: ต้องเปิดการ์ดก่อนจึงจะไปต่อได้
- **Character Counter**: แสดง X/20 ตอนตั้งชื่อเล่น
- **Flow สร้างห้องถูกต้อง**: กด "สร้างห้อง" → เปิด modal → ค่อยสร้าง ไม่เข้าเกมเอง

---

## 🚀 วิธีการรันโปรเจกต์ (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน WebSocket Server (Real-Time Multiplayer)
```bash
npm run server
```

### 3. รัน Development Web Server
```bash
npm run dev
```

### 4. สั่ง Build สำหรับ Production
```bash
npm run build
```

---

## 🗂️ โครงสร้างโปรเจกต์

```
wonglao/
├── server.js                  # WebSocket server (Node.js + ws)
├── src/
│   ├── App.jsx                # Root component, routing, WS state
│   ├── data/
│   │   └── decks.js           # INTENSITY_LEVELS + card deck definitions
│   ├── components/
│   │   ├── CardGame.jsx       # การ์ดเกม + scoreboard + turn-based
│   │   ├── CrocodileDentist.jsx
│   │   ├── SpinWheel.jsx
│   │   ├── DiceRoller.jsx
│   │   ├── FingerChooser.jsx
│   │   ├── CustomDeckBuilder.jsx
│   │   ├── RoomLobby.jsx      # Lobby: intensity selector, player list
│   │   ├── RoomModal.jsx      # Modal: create/join room
│   │   ├── StatsModal.jsx     # สถิติแยกตามระดับ
│   │   ├── PartyPassModal.jsx # VIP unlock
│   │   └── LegalModal.jsx
│   └── utils/
│       ├── websocket.js       # wsClient singleton
│       ├── audio.js           # soundManager (Web Audio API)
│       └── supabase.js        # Supabase client
└── index.html
```

---

## ⚖️ Legal & Compliance Note
- **ข้อตกลงและคำเตือน**: อายุ 18+, เมาไม่ขับ, สิทธิ์ในการปฏิเสธภารกิจหากเห็นว่าไม่ปลอดภัย
- **พ.ร.บ. ควบคุมเครื่องดื่มแอลกอฮอล์ ม.32**: ไม่มีการโฆษณาสุรา ไม่แสดงภาพ/โลโก้ยี่ห้อสุราจริง ใช้คำกลาง เช่น "ดื่ม 1 ยก" หรือ "ทำภารกิจ"
