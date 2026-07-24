// WongLao (วงเหล้า) - Thai Party Decks & Card Store

export const DECK_TYPES = {
  TRUTH_OR_DARE: 'truth_or_dare',
  NEVER_HAVE_I_EVER: 'never_have_i_ever',
  MOST_LIKELY_TO: 'most_likely_to'
};

export const INTENSITY_LEVELS = {
  JIB: {
    id: 'free',
    name: 'จิบ',
    color: 'from-emerald-500 to-teal-400',
    badge: '🟢 สายจิบชิลๆ',
    isPremium: false,
    description: 'เหมาะกับเพื่อนใหม่ ละลายพฤติกรรม จิบเบาๆ 1-3 ยก'
  },
  KAEW: {
    id: 'spicy',
    name: 'แก้ว',
    color: 'from-cyan-500 to-blue-600',
    badge: '🔵 สายซดเต็มแก้ว',
    isPremium: false,
    description: 'คำถามสายแซ่บ จัดเต็มแก้ว 4-7 ยก เครื่องติดแน่นอน'
  },
  KLOM: {
    id: 'extreme',
    name: 'กลม',
    color: 'from-pink-500 to-rose-600',
    badge: '🔴 สายเปิดกลมวงแตก',
    isPremium: true,
    description: 'แฉความลับ วงแตก จัดหนัก 8-10 ยก ตับทรหด!'
  },
  CUSTOM: {
    id: 'custom',
    name: 'Custom (VIP)',
    color: 'from-amber-500 to-purple-600',
    badge: '👑 โหมด VIP Custom',
    isPremium: true,
    description: 'สร้างการ์ดคำถาม และกำหนดระดับความห้าวเองตามใจชอบ (1-10 ยก)'
  }
};

export const INITIAL_DECKS = [
  // --- TRUTH OR DARE (ความจริงหรือความกล้า) ---
  {
    id: 'tod_free_1',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'free',
    prompt: 'ความจริง: เรื่องฮาๆ อายที่สุดที่เคยเกิดขึ้นกับคุณในที่สาธารณะคืออะไร?',
    penalty: 'ดื่ม 1 ยก หรือ เล่าให้จบภายใน 30 วินาที'
  },
  {
    id: 'tod_free_2',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'free',
    prompt: 'ความกล้า: เต้นท่าที่คิดว่าตลกที่สุดกลางวงเป็นเวลา 15 วินาที',
    penalty: 'ดื่ม 1 ยก หากไม่ยอมเต้น'
  },
  {
    id: 'tod_free_3',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'free',
    prompt: 'ความจริง: ดารา หรืออินฟลูเอนเซอร์คนไหนที่คุณแอบชอบมากที่สุด?',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_4',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'free',
    prompt: 'ความกล้า: ส่งสติกเกอร์รูปหัวใจให้คนที่คุยอยู่ล่าสุดในแชตโดยไม่พิมอะไรต่อ',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_1',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'spicy',
    prompt: 'ความจริง: จูบแรกเกิดขึ้นตอนอายุเท่าไหร่ และเกิดขึ้นที่ไหน?',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_2',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'spicy',
    prompt: 'ความกล้า: สบตากับคนที่นั่งทางขวามือเป็นเวลา 20 วินาทีโดยห้ามยิ้มหรือหัวเราะ',
    penalty: 'ดื่ม 1 ยกทั้งคู่ถ้าหลุดหัวเราะ'
  },
  {
    id: 'tod_spicy_3',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'spicy',
    prompt: 'ความจริง: สเปกคนที่คุณพ่ายแพ้ทางความน่ารักในวงนี้คือใคร?',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_extreme_1',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'extreme',
    prompt: 'ความจริง: เคยแอบชอบแฟนเก่าของเพื่อนสนิทตนเองหรือไม่?',
    penalty: 'ดื่มหมดแก้ว!'
  },
  {
    id: 'tod_extreme_2',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'extreme',
    prompt: 'ความกล้า: โทรหาคนคุยเก่าแล้วพูดว่า "คิดถึงนะ" แล้ววางสายทันที',
    penalty: 'ดื่ม 3 ยกใหญ่'
  },

  // --- NEVER HAVE I EVER (ฉันไม่เคย) ---
  {
    id: 'nhie_free_1',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... แกล้งหลับในห้องเรียนหรือในที่ทำงาน',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_free_2',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... กดเข้าสตอรี่ไอจีคนอื่นแล้วเผลอมือไปโดนปุ่มกดส่งหัวใจ',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_free_3',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... ทำอาหารหกใส่พื้นแล้วหยิบขึ้นมากินต่อตามกฎ 5 วินาที',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_spicy_1',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'spicy',
    prompt: 'ฉันไม่เคย... แอบส่องแชตหรือรูปเก่าของแฟนเก่าตอนตีสอง',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },
  {
    id: 'nhie_spicy_2',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'spicy',
    prompt: 'ฉันไม่เคย... คุยซ้อนมากกว่า 2 คนพร้อมกัน',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },
  {
    id: 'nhie_extreme_1',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'extreme',
    prompt: 'ฉันไม่เคย... เผลอส่งแชตด่าคนอื่นผิดกลุ่มไปเข้ากลุ่มเจ้าตัว',
    penalty: 'ใครเคยดื่มหมดแก้ว!'
  },
  {
    id: 'nhie_extreme_2',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'extreme',
    prompt: 'ฉันไม่เคย... โกหกเพื่อนในวงนี้เกี่ยวกับเรื่องแฟนหรือคนคุย',
    penalty: 'ใครเคยดื่ม 3 ยก'
  },

  // --- MOST LIKELY TO (ใครมีโอกาสสุด) ---
  {
    id: 'mlt_free_1',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... นอนหลับคาวงเหล้าเป็นคนแรกมากที่สุด?',
    penalty: 'นับ 1 2 3 แล้วชี้พร้อมกัน! คนโดนชี้เยอะสุดดื่ม 1 ยก'
  },
  {
    id: 'mlt_free_2',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... โดนแก๊งคอลเซ็นเตอร์หลอกเงินมากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้เยอะสุดดื่ม 1 ยก'
  },
  {
    id: 'mlt_spicy_1',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'spicy',
    prompt: 'ใครในวงนี้มีโอกาส... โทรหาแฟนเก่าตอนเมามากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้เยอะสุดดื่ม 2 ยก'
  },
  {
    id: 'mlt_spicy_2',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'spicy',
    prompt: 'ใครในวงนี้มีโอกาส... เปย์เงินให้คนคุยหมดตัวมากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้เยอะสุดดื่ม 2 ยก'
  },
  {
    id: 'mlt_extreme_1',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'extreme',
    prompt: 'ใครในวงนี้มีความลับเยอะที่สุดแต่ไม่เคยเล่าให้ใครฟัง?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 ยก หรือยอมแฉ 1 ความลับ'
  },

  // --- NEW 50 RANDOM PARTY CARDS ---
  // Truth or Dare (Free)
  {
    id: 'tod_free_5',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'free',
    prompt: 'ความจริง: เคยแอบปลื้มคนในห้องนี้มากกว่า 1 คนหรือไม่?',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_6',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'free',
    prompt: 'ความกล้า: ให้คนที่นั่งทางซ้ายมือเพ้นท์หน้าน้องด้วยลิปสติกเป็นรูปอะไรก็ได้',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_7',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'free',
    prompt: 'ความจริง: เงินเดือนหรือรายได้ก้อนแรกเอาไปซื้ออะไรไร้สาระที่สุด?',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_8',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'free',
    prompt: 'ความกล้า: ทำท่าเลียนแบบสติ๊กเกอร์ไลน์ที่ชอบใช้บ่อยที่สุดให้เพื่อนทาย',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_9',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'free',
    prompt: 'ความจริง: เคยแกล้งส่งข้อความผิดหาใครแล้วต้องหาเนียนแถแก้ตัวไหม?',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_10',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'free',
    prompt: 'ความกล้า: ตบหน้าอกตัวเองแล้วร้องเสียงเหมือนทาร์ซานดังๆ 3 ครั้ง',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_11',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'free',
    prompt: 'ความจริง: เรื่องโกหกเรื่องไหนที่คุณเคยบอกเพื่อนในวงนี้แล้วยังไม่เคยเฉลย?',
    penalty: 'ดื่ม 1 ยก'
  },
  {
    id: 'tod_free_12',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'free',
    prompt: 'ความกล้า: ร้องเพลงท่อนฮิตของเพลงโปรดแบบใส่อารมณ์ลูกทุ่ง 15 วินาที',
    penalty: 'ดื่ม 1 ยก'
  },

  // Truth or Dare (Spicy)
  {
    id: 'tod_spicy_4',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'spicy',
    prompt: 'ความจริง: เคยเผลอมองเรือนร่างคนในวงนี้แล้วคิดในใจว่าน่ารัก/มีเสน่ห์ไหม?',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_5',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'spicy',
    prompt: 'ความกล้า: ให้คนที่นั่งฝั่งตรงข้ามตั้งฉายาสุดแซ่บให้คุณ แล้วต้องใช้ชื่อนี้จนจบเกม',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_6',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'spicy',
    prompt: 'ความจริง: ประสบการณ์เดตที่รู้สึกกระอักกระอ่วนหรือฮาที่สุดคือเรื่องอะไร?',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_7',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'spicy',
    prompt: 'ความกล้า: ส่งแชตเสียงหาคนคุยล่าสุดพูดว่า "คืนนี้อยากเจอจังเลย"',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_8',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'spicy',
    prompt: 'ความจริง: เคยเผลอนึกถึงแฟนเก่าตอนกำลังสวีทกับคนปัจจุบันไหม?',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_9',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'spicy',
    prompt: 'ความกล้า: กระซิบข้างหูคนที่นั่งขวามือด้วยน้ำเสียงเซ็กซี่ 5 วินาที',
    penalty: 'ดื่ม 2 ยก'
  },
  {
    id: 'tod_spicy_10',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'spicy',
    prompt: 'ความจริง: สถานที่แปลกที่สุดที่คุณเคยจูบหรือกอดกับใครคือที่ไหน?',
    penalty: 'ดื่ม 2 ยก'
  },

  // Truth or Dare (Extreme)
  {
    id: 'tod_extreme_3',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'extreme',
    prompt: 'ความจริง: ในวงนี้ มีใครที่คุณไม่อยากให้เขามาเป็นแฟนกับเพื่อนสนิทคุณที่สุด?',
    penalty: 'ดื่มหมดแก้ว!'
  },
  {
    id: 'tod_extreme_4',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'extreme',
    prompt: 'ความกล้า: ปลดล็อกโทรศัพท์แล้วเปิดหน้าค้นหา Google ให้เพื่อนดู 3 รายการล่าสุด',
    penalty: 'ดื่ม 3 ยกใหญ่'
  },
  {
    id: 'tod_extreme_5',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'extreme',
    prompt: 'ความจริง: เคยโกหกเรื่องความสัมพันธ์ว่าโสด ทั้งที่มีคนคุยอยู่แล้วหรือไม่?',
    penalty: 'ดื่ม 3 ยก'
  },
  {
    id: 'tod_extreme_6',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'dare',
    intensity: 'extreme',
    prompt: 'ความกล้า: โทรหาเพื่อนที่ไม่ได้อยู่ในวงแล้วถามว่า "ถ้ายอมคบตอนนี้ คิดกี่บาท"',
    penalty: 'ดื่มหมดแก้ว!'
  },
  {
    id: 'tod_extreme_7',
    deckType: DECK_TYPES.TRUTH_OR_DARE,
    type: 'truth',
    intensity: 'extreme',
    prompt: 'ความจริง: ใครในวงนี้ที่คุณเคยแอบเขินเวลาโดนตัวมากที่สุด?',
    penalty: 'ดื่ม 2 ยก'
  },

  // Never Have I Ever (Free)
  {
    id: 'nhie_free_4',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... แอบสั่งอาหารเดลิเวอรีมากินคนเดียวตอนตีหนึ่งแล้วไม่แบ่งใคร',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_free_5',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... เดินชนประตูม้วนหรือกระจกใสเพราะมองไม่เห็น',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_free_6',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... กดไลก์รูปแฟนเก่าของเพื่อนแล้วรีบกดยกเลิกภายใน 1 วินาที',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_free_7',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... ซื้อเสื้อผ้ามาใส่ครั้งเดียวถ่ายรูปแล้วตั้งทิ้งไว้ในตู้',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_free_8',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... ทำทีเป็นคุยโทรศัพท์เพราะอยากเลี่ยงคนที่ไม่อยากคุยด้วย',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },
  {
    id: 'nhie_free_9',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'free',
    prompt: 'ฉันไม่เคย... แกล้งทำเป็นเห็นข้อความแชตช้าเพื่อไม่อยากตอบ',
    penalty: 'ใครเคยดื่ม 1 ยก'
  },

  // Never Have I Ever (Spicy)
  {
    id: 'nhie_spicy_3',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'spicy',
    prompt: 'ฉันไม่เคย... ฝันทะลึ่งถึงคนในวงนี้หรือเพื่อนร่วมงาน',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },
  {
    id: 'nhie_spicy_4',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'spicy',
    prompt: 'ฉันไม่เคย... แอบส่องแชตคนคุยเก่าตอนเมาแล้วกดส่งสติกเกอร์เผลอมือ',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },
  {
    id: 'nhie_spicy_5',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'spicy',
    prompt: 'ฉันไม่เคย... ลองแอปหาคู่แล้วเจอคนรู้จักจนต้องรีบลบแอป',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },
  {
    id: 'nhie_spicy_6',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'spicy',
    prompt: 'ฉันไม่เคย... ส่งรูปเซลฟี่สุดแซ่บให้คนคุยแล้วเสียใจทีหลัง',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },
  {
    id: 'nhie_spicy_7',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'spicy',
    prompt: 'ฉันไม่เคย... จูบใครเกิน 3 คนภายในสัปดาห์เดียวกัน',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },

  // Never Have I Ever (Extreme)
  {
    id: 'nhie_extreme_3',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'extreme',
    prompt: 'ฉันไม่เคย... คุยสับขาหลอกมากกว่า 3 คนพร้อมกันในเวลาเดียวกัน',
    penalty: 'ใครเคยดื่มหมดแก้ว!'
  },
  {
    id: 'nhie_extreme_4',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'extreme',
    prompt: 'ฉันไม่เคย... แอบลบรูปคู่แฟนเก่าออกจากไอจีแล้วทำเหมือนไม่มีอะไรเกิดขึ้น',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },
  {
    id: 'nhie_extreme_5',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'extreme',
    prompt: 'ฉันไม่เคย... เผลอบอกรักใครตอนเมาแล้วตื่นมาจำไม่ได้',
    penalty: 'ใครเคยดื่ม 3 ยก'
  },
  {
    id: 'nhie_extreme_6',
    deckType: DECK_TYPES.NEVER_HAVE_I_EVER,
    type: 'never',
    intensity: 'extreme',
    prompt: 'ฉันไม่เคย... แอบเช็กโทรศัพท์คนคุยตอนเขาเข้าห้องน้ำ',
    penalty: 'ใครเคยดื่ม 2 ยก'
  },

  // Most Likely To (Free)
  {
    id: 'mlt_free_3',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... โดนแม่ค้าแถมของกินฟรีเพราะพูดเก่งมากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 1 ยก'
  },
  {
    id: 'mlt_free_4',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... หายตัวไปจากกลุ่มแชต 3 วันแล้วกลับมาบอกว่าเผลอนอนหลับ?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 1 ยก'
  },
  {
    id: 'mlt_free_5',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... ร้องไห้กลางโรงหนังเพราะอินกับซีรีส์มากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 1 ยก'
  },
  {
    id: 'mlt_free_6',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... ทำโทรศัพท์ตกน้ำหรือตกตึกเป็นคนแรก?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 1 ยก'
  },
  {
    id: 'mlt_free_7',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... หิ้วของกินกลับบ้านเยอะที่สุดจากงานปาร์ตี้?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 1 ยก'
  },
  {
    id: 'mlt_free_8',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'free',
    prompt: 'ใครในวงนี้มีโอกาส... ซื้อสายชาร์จใหม่สัปดาห์ละเส้นเพราะทำหายบ่อยที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 1 ยก'
  },

  // Most Likely To (Spicy)
  {
    id: 'mlt_spicy_3',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'spicy',
    prompt: 'ใครในวงนี้มีโอกาส... ตกหลุมรักคนง่ายที่สุดเพียงแค่เขาช่วยถือของ?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 ยก'
  },
  {
    id: 'mlt_spicy_4',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'spicy',
    prompt: 'ใครในวงนี้มีโอกาส... โทรหาคนคุยตอนตีสองเพื่อชวนออกมาหาอะไรกิน?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 ยก'
  },
  {
    id: 'mlt_spicy_5',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'spicy',
    prompt: 'ใครในวงนี้มีโอกาส... โดนเทกลางเดตเพราะพูดกวนประสาทมากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 ยก'
  },
  {
    id: 'mlt_spicy_6',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'spicy',
    prompt: 'ใครในวงนี้มีโอกาส... เปย์ของขวัญแพงๆ ให้คนที่พึ่งรู้จักกันไม่ถึงเดือน?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 ยก'
  },
  {
    id: 'mlt_spicy_7',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'spicy',
    prompt: 'ใครในวงนี้มีโอกาส... โดนจับได้ว่าคุยซ้อนมากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 ยก'
  },

  // Most Likely To (Extreme)
  {
    id: 'mlt_extreme_2',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'extreme',
    prompt: 'ใครในวงนี้มีโอกาส... แอบชอบแฟนของเพื่อนในวงมากที่สุด?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 3 ยก'
  },
  {
    id: 'mlt_extreme_3',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'extreme',
    prompt: 'ใครในวงนี้มีโอกาส... โดนไล่ออกจากวงเหล้าเพราะพูดตรงเกินไป?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่มหมดแก้ว!'
  },
  {
    id: 'mlt_extreme_4',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'extreme',
    prompt: 'ใครในวงนี้มีความลับเรื่องความรักที่ถ้าแฉแล้ววงแตกแน่นอน?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 3 ยก'
  },
  {
    id: 'mlt_extreme_5',
    deckType: DECK_TYPES.MOST_LIKELY_TO,
    type: 'likely',
    intensity: 'extreme',
    prompt: 'ใครในวงนี้มีโอกาส... ตื่นมาแล้วจำไม่ได้ว่าเมื่อคืนทำอะไรลงไปบ้าง?',
    penalty: 'ชี้พร้อมกัน! คนโดนชี้ดื่ม 2 ยก'
  }
];

export function getCustomDecks() {
  try {
    const saved = localStorage.getItem('wonglao_custom_decks');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomDecks(decks) {
  try {
    localStorage.setItem('wonglao_custom_decks', JSON.stringify(decks));
  } catch (e) {
    console.error('Failed to save custom decks', e);
  }
}
