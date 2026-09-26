import { GEAR_BY_ID, KEYWORD_LABEL, SPELL_BY_ID, type KeywordId } from '../data/content';
import { beginBattle } from './battle';
import {
  type ActionResult,
  type GameState,
  type Phase,
  addItem,
  countItem,
  findMember,
  learnKeyword,
  makeGordon,
  makeJosef,
  makeLeila,
  makeLeonEndgame,
  makeMinwu,
  makeRicard,
  moveGuestToReserve,
  note,
  removeFromPlay,
  setPhase,
  takeGuest,
  takeItem,
} from './model';
import { MAPS, TOWN_SPOTS, dismountChocobo, mountChocobo, spot } from './world';

export interface NpcView {
  id: string;
  name: string;
  mapId: string;
  x: number;
  y: number;
  sprite: string;
}

const LATE: Phase[] = ['to-deist', 'deist-cavern', 'ricard-joined', 'to-mysidia', 'need-mask', 'to-tower', 'after-minwu', 'cyclone', 'after-cyclone', 'to-palamecia', 'after-emperor', 'to-jade', 'pandaemonium', 'ending'];

function pushed(id: string, name: string, mapId: string, x: number, y: number, sprite: string): NpcView {
  return { id, name, mapId, x, y, sprite };
}

export function visibleNpcs(state: GameState): NpcView[] {
  const npcs: NpcView[] = [];
  const serviceTowns = ['altair', 'gatrea', 'paloom', 'poft', 'salamand', 'bafsk', 'fynn', 'mysidia'];
  for (const town of serviceTowns) {
    npcs.push(pushed(`${town}-inn`, 'Innkeeper', town, TOWN_SPOTS.inn.x, TOWN_SPOTS.inn.y, 'inn'));
    npcs.push(pushed(`${town}-shop`, 'Shopkeeper', town, TOWN_SPOTS.shop.x, TOWN_SPOTS.shop.y, 'shop'));
    npcs.push(pushed(`${town}-priest`, 'Priest', town, TOWN_SPOTS.priest.x, TOWN_SPOTS.priest.y, 'priest'));
  }
  npcs.push(pushed('altair-rebel', 'Rebel', 'altair', TOWN_SPOTS.square.x, TOWN_SPOTS.square.y, 'rebel'));
  npcs.push(pushed('practice-post', 'Practice Post', 'altair', 12, 4, 'post'));
  npcs.push(pushed('quartermaster', 'Quartermaster', 'altair', TOWN_SPOTS.hall2.x, TOWN_SPOTS.hall2.y, 'rebel'));
  const hildaPrison = ['after-lamia', 'to-castle-fynn'].includes(state.phase) && !state.flags.hildaRescued;
  const hildaCaptured = ['after-dreadnought', 'to-leila', 'leviathan', 'after-leviathan', 'to-coliseum', 'after-lamia', 'to-castle-fynn'].includes(state.phase) && !state.flags.hildaRescued;
  if (hildaPrison) {
    const cell = spot('castle-fynn-b1', 0.4);
    npcs.push(pushed('hilda', 'Princess Hilda', 'castle-fynn-b1', cell.x, cell.y, 'hilda'));
  } else if (!hildaCaptured) {
    npcs.push(pushed('hilda', 'Princess Hilda', 'altair', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'hilda'));
  }
  if (!state.flags.scottDead) npcs.push(pushed('scott', 'Scott', 'fynn', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'scott'));
  if (!state.party.some((c) => c.id === 'josef') && !state.flags.josefDead && state.phase !== 'intro') {
    npcs.push(pushed('josef', 'Josef', 'salamand', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'josef'));
  }
  npcs.push(pushed('smith', 'Smith', 'salamand', TOWN_SPOTS.hall2.x, TOWN_SPOTS.hall2.y, 'smith'));
  if (state.flags.nellyFreed) npcs.push(pushed('nelly', 'Nelly', 'salamand', TOWN_SPOTS.square.x, TOWN_SPOTS.square.y, 'nelly'));
  else if (['to-semitt', 'semitt-clear'].includes(state.phase) || state.mapId.startsWith('semitt')) {
    const at = spot('semitt-3', 0.28);
    npcs.push(pushed('nelly', 'Nelly', 'semitt-3', at.x, at.y, 'nelly'));
  }
  if (!state.flags.paulMythril || state.mapId.startsWith('semitt')) {
    const at = spot('semitt-3', 0.62);
    npcs.push(pushed('paul', 'Paul', 'semitt-3', at.x, at.y, 'paul'));
  } else if (['need-pass', 'to-bafsk', 'saw-dreadnought'].includes(state.phase) && !state.flags.paulInfiltration) {
    npcs.push(pushed('paul', 'Paul', 'bafsk', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'paul'));
  } else if (['after-lamia', 'to-castle-fynn'].includes(state.phase) && !state.flags.paulFynnGate) {
    const gate = spot('castle-fynn-1', 0.3);
    npcs.push(pushed('paul', 'Paul', 'castle-fynn-1', gate.x, gate.y, 'paul'));
  }
  npcs.push(pushed('cid', 'Cid', 'poft', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'cid'));
  npcs.push(pushed('paloom-sailor', 'Sailor', 'paloom', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'sailor'));
  npcs.push(pushed('bafsk-miner', 'Miner', 'bafsk', TOWN_SPOTS.square.x, TOWN_SPOTS.square.y, 'miner'));
  if (!state.party.some((c) => c.id === 'gordon') && !state.reserve.some((c) => c.id === 'gordon')) {
    const g = spot('kashuan-1', 0.2);
    npcs.push(pushed('gordon', 'Gordon', 'kashuan-1', g.x, g.y, 'gordon'));
  }
  const tablet = spot('kashuan-2', 0.5);
  npcs.push(pushed('kashuan-tablet', 'Stone Tablet', 'kashuan-2', tablet.x, tablet.y, 'tablet'));
  const flame = spot('kashuan-3', 0.85);
  npcs.push(pushed('kashuan-flame', 'Sacred Flame', 'kashuan-3', flame.x, flame.y, 'flame'));
  const berth = spot('bafsk-cave-2', 0.9);
  npcs.push(pushed('dreadnought-berth', 'Warship Berth', 'bafsk-cave-2', berth.x, berth.y, 'ship'));
  if (!state.party.some((c) => c.id === 'leila') && !state.fallen.includes('leila')) {
    npcs.push(pushed('leila', 'Leila', 'paloom', TOWN_SPOTS.square.x, TOWN_SPOTS.square.y, 'leila'));
  }
  const dragoon = spot('castle-deist-2', 0.4);
  npcs.push(pushed('deist-dragoon', 'Dying Dragoon', 'castle-deist-2', dragoon.x, dragoon.y, 'dragoon'));
  const wyvern = spot('deist-cave-2', 0.7);
  npcs.push(pushed('wyvern', 'Wyvern', 'deist-cave-2', wyvern.x, wyvern.y, 'wyvern'));
  if (!state.party.some((c) => c.id === 'ricard') && !state.flags.ricardDead) {
    const ricard = spot('deist-cave-2', 0.35);
    npcs.push(pushed('ricard', 'Ricard', 'deist-cave-2', ricard.x, ricard.y, 'ricard'));
  }
  npcs.push(pushed('mysidia-elder', 'Elder', 'mysidia', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'elder'));
  if (!state.flags.minwuDead && ['to-tower', 'need-mask'].includes(state.phase)) {
    const seal = spot('tower-4', 0.8);
    npcs.push(pushed('ultima-seal', 'Ultima Seal', 'tower-4', seal.x, seal.y, 'seal'));
  }
  if (!state.flags.courierComplete) {
    npcs.push(pushed('gatrea-courier', 'Courier', 'gatrea', TOWN_SPOTS.hall.x, TOWN_SPOTS.hall.y, 'rebel'));
  }
  npcs.push(pushed('chocobo', 'Chocobo', 'chocobo-forest', TOWN_SPOTS.square.x, TOWN_SPOTS.square.y, 'chocobo'));
  if (state.phase === 'cyclone' && state.party.some((c) => c.id === 'ricard')) {
    const gate = spot('cyclone-2', 0.45);
    npcs.push(pushed('cyclone-gate', 'Breaking Gate', 'cyclone-2', gate.x, gate.y, 'gate'));
  }
  void LATE;
  return npcs;
}

function near(state: GameState, npc: NpcView): boolean {
  return state.mapId === npc.mapId && Math.max(Math.abs(state.x - npc.x), Math.abs(state.y - npc.y)) <= 1;
}

function ok(messages: string[]): ActionResult {
  return { ok: true, messages };
}
function fail(error: string, message: string): ActionResult {
  return { ok: false, error, messages: [message] };
}

function say(state: GameState, line: string): ActionResult {
  note(state, line);
  return ok([line]);
}

function teach(state: GameState, id: KeywordId, line: string): ActionResult {
  const fresh = learnKeyword(state, id);
  const learned = fresh ? ` Learned ${KEYWORD_LABEL[id]}.` : '';
  return say(state, `${line}${learned}`);
}

export function talk(state: GameState, npcId: string, keyword?: KeywordId): ActionResult {
  if (state.battle) return fail('in-battle', 'Not during a battle.');
  if (keyword && !state.keywords.includes(keyword)) {
    return fail('unlearned-keyword', `You have not learned ${KEYWORD_LABEL[keyword]}.`);
  }
  const npc = visibleNpcs(state).find((entry) => entry.id === npcId);
  if (!npc) return fail('not-here', 'No one here answers to that.');
  if (!near(state, npc)) return fail('too-far', 'Step closer.');
  return converse(state, npcId, keyword);
}

function converse(state: GameState, npcId: string, keyword?: KeywordId): ActionResult {
  if (npcId.endsWith('-inn')) return say(state, 'Beds are ready. The dead are beyond a night\'s sleep.');
  if (npcId.endsWith('-shop')) return say(state, 'The counter is open: weapons, armor, medicine, tomes.');
  if (npcId.endsWith('-priest')) return say(state, 'The sanctuary will call back the dead for 200 gil. Those the story has taken are beyond me.');
  if (npcId === 'practice-post') {
    beginBattle(state, 'practice-dummy');
    return say(state, 'The post waits. Hit it, cast at it, learn what rises.');
  }
  if (npcId === 'chocobo') return mountChocobo(state);
  if (npcId === 'altair-rebel') {
    if (!state.keywords.includes('wild-rose')) return teach(state, 'wild-rose', 'Whisper it only to the princess: Wild Rose.');
    if (!state.keywords.includes('palamecia')) return teach(state, 'palamecia', 'The empire\'s name is Palamecia. Remember it.');
    return say(state, 'The rose still has thorns. Trust the objective.');
  }
  if (npcId === 'hilda') {
    if (keyword === 'wild-rose' && !state.flags.joinedRebellion) {
      state.flags.joinedRebellion = true;
      setPhase(state, 'to-fynn');
      learnKeyword(state, 'palamecia');
      return say(state, 'Then you are of the Wild Rose. Palamecia holds Fynn. Scott is hiding there. Find him. Learned Palamecia.');
    }
    if (!state.flags.joinedRebellion) return say(state, 'Altair shelters the rebellion. If you are ours, you know the word.');
    if (state.phase === 'report-scott' || (state.flags.scottDead && state.phase === 'to-fynn')) {
      state.flags.ringDelivered = true;
      state.flags.ferryAvailable = true;
      setPhase(state, 'to-salamand');
      return say(state, 'Scott\'s ring... so he is gone. The empire builds the Dreadnought with mythril from Semitt Falls. Find Josef in Salamand. A sailor in Paloom will sell passage to Poft.');
    }
    if (state.phase === 'saw-dreadnought' || (state.flags.sawDreadnought && state.phase === 'need-pass')) {
      setPhase(state, 'to-snow');
      return teach(state, 'goddess-bell', 'Steel will not scratch that ship. Seek the Goddess\'s Bell in the snow cavern. It opens Kashuan, where Sunfire can be born.');
    }
    if (state.mapId === 'castle-fynn-b1' && !state.flags.hildaRescued) {
      if (!state.flags.gottosDefeated) return say(state, 'Hilda is behind the bars. Gottos still holds the keep.');
      state.flags.hildaRescued = true;
      state.flags.fynnLiberated = true;
      setPhase(state, 'fynn-free');
      return say(state, 'The real Hilda takes your hand. Fynn is free. The Lamia was a mask. The rose holds the castle again.');
    }
    if (state.flags.hildaRescued && state.phase === 'fynn-free') {
      setPhase(state, 'to-deist');
      return teach(state, 'dragoons', 'Fynn stands. The Dragoons of Deist may still answer. Go to their castle.');
    }
    if (state.phase === 'ricard-joined') {
      setPhase(state, 'to-mysidia');
      return teach(state, 'mysidia', 'Ricard is a beginning. The mages of Mysidia keep the Ultima Tome. Ask them.');
    }
    if (keyword) return say(state, `Hilda considers ${KEYWORD_LABEL[keyword]}. "Hold to the objective."`);
    return say(state, state.objective);
  }
  if (npcId === 'scott') {
    if (state.flags.scottDead) return say(state, 'He is gone.');
    state.flags.scottDead = true;
    addItem(state, 'ring', 1);
    learnKeyword(state, 'mythril');
    learnKeyword(state, 'dreadnought');
    takeGuest(state, 'minwu', makeMinwu);
    setPhase(state, 'report-scott');
    return say(state, 'Scott dies with your names in his mouth. "Mythril... the Dreadnought..." Minwu, who tended him, joins you. Take the ring to Hilda.');
  }
  if (npcId === 'paloom-sailor') {
    if (!state.flags.ferryAvailable) return say(state, 'The packet does not sail for wanderers.');
    if (state.flags.ferryPass) return say(state, 'Passage to Poft is paid. The boat will know you.');
    if (state.gil < 50) return fail('need-gil', 'Passage to Poft is 50 gil.');
    state.gil -= 50;
    state.flags.ferryPass = true;
    return say(state, 'Paid. The boat runs Paloom to Poft.');
  }
  if (npcId === 'cid') {
    if (!state.keywords.includes('airship')) return teach(state, 'airship', 'I keep an airship. I will not fly it into Palamecia\'s guns. Not yet.');
    if (!state.vehicles.airship && ['after-dreadnought', 'to-leila', 'after-leviathan', 'fynn-free', 'ricard-joined', 'after-cyclone', 'after-emperor', 'to-palamecia'].includes(state.phase)) {
      state.vehicles.airship = true;
      state.flags.airshipLent = true;
      return say(state, 'The Dreadnought is scrap. Take the airship. Land on open ground. She will not love mountains, but she will cross them.');
    }
    if (state.vehicles.airship) return say(state, 'She is yours. Treat her kindly.');
    return say(state, 'Come back when that warship is ash.');
  }
  if (npcId === 'josef') {
    if (keyword === 'mythril' && !state.party.some((c) => c.id === 'josef') && !state.flags.josefDead) {
      if (state.party.some((c) => c.id === 'minwu')) moveGuestToReserve(state, 'minwu');
      takeGuest(state, 'josef', makeJosef);
      state.vehicles.canoe = true;
      state.flags.josefJoined = true;
      setPhase(state, 'to-semitt');
      return say(state, 'Mythril. They dragged Nelly to Semitt Falls. My canoe will take the river. Minwu returns to Altair — I am going with you.');
    }
    if (state.party.some((c) => c.id === 'josef')) return say(state, 'Nelly is in the falls. Move.');
    return say(state, 'My daughter is in the empire\'s mine. Name the ore, or leave me be.');
  }
  if (npcId === 'nelly') {
    if (!state.flags.sergeantDefeated) return say(state, 'Nelly rattles the bars. "The sergeant keeps the key."');
    if (!state.flags.nellyFreed) {
      state.flags.nellyFreed = true;
      return say(state, 'The cell opens. Nelly runs for Salamand. "Father — the vault is past Paul."');
    }
    return say(state, 'Nelly is safe in Salamand.');
  }
  if (npcId === 'paul') {
    if (state.mapId.startsWith('semitt')) {
      if (!state.flags.sergeantDefeated) return say(state, 'Paul grins with a bloody lip. "Drop the sergeant. Then I\'ll open the mythril vault."');
      state.flags.paulOpenedMythrilDoor = true;
      state.flags.paulMythril = true;
      return say(state, 'Paul picks the vault lock in four breaths. "Mythril\'s yours. Don\'t tell the empire I helped."');
    }
    if (state.mapId === 'bafsk' && !state.flags.paulInfiltration) {
      addItem(state, 'pass', 1);
      state.flags.paulInfiltration = true;
      return say(state, 'Paul palms you an imperial pass. "Cave under the town. Walk like you own the war."');
    }
    if (state.mapId.startsWith('castle-fynn') && !state.flags.paulFynnGate) {
      state.flags.paulFynnGate = true;
      state.flags.paulCastle = true;
      setPhase(state, 'to-castle-fynn');
      return say(state, 'Paul cracks the drainage gate. "Gottos is upstairs. Hilda is below. I\'ll keep the exit honest."');
    }
    return say(state, 'Paul is already elsewhere.');
  }
  if (npcId === 'smith') {
    if (countItem(state, 'mythril') > 0 && !state.flags.mythrilArmed) {
      takeItem(state, 'mythril', 1);
      addItem(state, 'mythril-sword', 1);
      addItem(state, 'mythril-axe', 1);
      addItem(state, 'mythril-bow', 1);
      state.flags.mythrilArmed = true;
      setPhase(state, 'to-bafsk');
      return say(state, 'The smith spends the ore. A mythril sword, axe, and bow are yours, and his racks will sell the rest. The finished plates were hauled to Bafsk — that is where the Dreadnought grows.');
    }
    if (state.flags.mythrilArmed) return say(state, 'Mythril gear stays on the rack.');
    return say(state, 'Bring mythril if you want an edge that bites their armor.');
  }
  if (npcId === 'bafsk-miner') {
    if (state.phase === 'to-bafsk') setPhase(state, 'need-pass');
    return say(state, 'The ship sits in a cave under our feet. The soldiers want a pass. A thief has been sniffing around the inn.');
  }
  if (npcId === 'dreadnought-berth') {
    state.flags.sawDreadnought = true;
    if (state.phase === 'need-pass' || state.phase === 'to-bafsk') setPhase(state, 'saw-dreadnought');
    return say(state, 'The Dreadnought lifts out of the rock and turns its guns on the coast. You cannot reach the engine from here.');
  }
  if (npcId === 'gordon') {
    if (!state.party.some((c) => c.id === 'gordon')) {
      takeGuest(state, 'gordon', makeGordon);
      state.flags.gordonJoined = true;
      setPhase(state, 'kashuan-open');
      learnKeyword(state, 'sunfire');
      return say(state, 'Gordon finds his nerve. "I am done running. Sunfire is born at the flame below, if you can learn Ekmet Teloess from the tablet."');
    }
    return say(state, 'Gordon steadies his spear. "I will not abandon another keep."');
  }
  if (npcId === 'kashuan-tablet') {
    addItem(state, 'egils-torch', 1);
    const taught = learnKeyword(state, 'ekmet-teloess');
    if (state.flags.kashuanOpened) setPhase(state, 'need-sunfire');
    return say(state, `The tablet gives up Egil's Torch and the words Ekmet Teloess.${taught ? ' Learned Ekmet Teloess.' : ''}`);
  }
  if (npcId === 'kashuan-flame') {
    if (keyword !== 'ekmet-teloess') return say(state, 'The flame does not answer. It is waiting for words you actually know.');
    if (countItem(state, 'egils-torch') <= 0) return say(state, 'The words are true, and you have nothing to burn them into.');
    takeItem(state, 'egils-torch', 1);
    addItem(state, 'sunfire', 1);
    state.flags.haveSunfire = true;
    setPhase(state, 'to-dreadnought');
    return say(state, 'Ekmet Teloess. The torch becomes Sunfire, white enough to hurt. Carry it into the Dreadnought.');
  }
  if (npcId === 'leila') {
    if (state.phase === 'after-dreadnought' || state.flags.dreadnoughtDestroyed) {
      if (state.party.some((c) => c.id === 'gordon')) moveGuestToReserve(state, 'gordon');
      if (!state.party.some((c) => c.id === 'leila')) takeGuest(state, 'leila', makeLeila);
      state.flags.leilaJoined = true;
      setPhase(state, 'to-leila');
      return say(state, 'Leila tips her hat. "I\'ll sail you. My crew is loyal. Mostly." Gordon stays behind to gather Fynn\'s loyalists.');
    }
    if (state.flags.leilaJoined) return say(state, 'Say the word on the water and we cast off.');
    return say(state, 'Leila eyes the harbor and says nothing useful yet.');
  }
  if (npcId === 'deist-dragoon') {
    addItem(state, 'pendant', 1);
    learnKeyword(state, 'dragoons');
    learnKeyword(state, 'wyverns');
    state.flags.dragoonMet = true;
    if (state.phase === 'to-deist') setPhase(state, 'deist-cavern');
    return say(state, 'The last dragoon in the keep is dying. "The wyvern is in the cavern. She will know the pendant. Ask her of Wyverns." Learned Dragoons. Learned Wyverns.');
  }
  if (npcId === 'wyvern') {
    if (!state.keywords.includes('wyverns')) return say(state, 'The wyvern will not look at you.');
    addItem(state, 'wyvern-egg', 1);
    state.flags.wyvernSeen = true;
    state.flags.deistWyvern = true;
    return say(state, 'You speak of Wyverns. She gives you the last egg and a tired trust. Ricard is deeper in the cave.');
  }
  if (npcId === 'ricard') {
    if (keyword !== 'dragoons') return say(state, 'Ricard bars the nest. "Name what you are to the Dragoons."');
    if (!state.flags.wyvernSeen && countItem(state, 'wyvern-egg') <= 0) return say(state, 'Ricard shakes his head. "The mother has not accepted you."');
    if (state.party.some((c) => c.id === 'gordon')) moveGuestToReserve(state, 'gordon');
    if (state.party.some((c) => c.id === 'leila')) moveGuestToReserve(state, 'leila');
    takeGuest(state, 'ricard', makeRicard);
    state.flags.ricardJoined = true;
    setPhase(state, 'ricard-joined');
    return say(state, 'Ricard kneels, then stands with you. The dragoons are one again. "Point me at the empire."');
  }
  if (npcId === 'mysidia-elder') {
    if (!state.keywords.includes('mask')) return teach(state, 'mask', 'Outsiders do not pass the tower. Learn the Mask.');
    if (keyword === 'mask' || keyword === 'mysidia' || keyword === 'ultima-tome') {
      learnKeyword(state, 'ultima-tome');
      state.flags.masksExplained = true;
      if (state.phase === 'to-mysidia' || state.phase === 'ricard-joined') setPhase(state, 'need-mask');
      return say(state, 'The elder nods at the word Mask. "The White Mask is in our cave. The Black Mask lies on the tropical island. Bring both to the tower. The Ultima Tome is sealed there." Learned Ultima Tome.');
    }
    return say(state, 'Ask with the word we gave you.');
  }
  if (npcId === 'ultima-seal') {
    if (!state.keywords.includes('mask')) return fail('unlearned-keyword', 'The seal does not know you.');
    if (!state.keywords.includes('ultima-tome')) return fail('unlearned-keyword', 'You do not know what is sealed here.');
    if (countItem(state, 'white-mask') <= 0 || countItem(state, 'black-mask') <= 0) return say(state, 'Both masks must be set on the altar.');
    removeFromPlay(state, 'minwu', true);
    state.flags.minwuDead = true;
    state.flags.ultimaLearnable = true;
    addItem(state, 'ultima-tome', 1);
    learnKeyword(state, 'cyclone');
    state.flags.cycloneOpen = true;
    setPhase(state, 'cyclone');
    return say(state, 'Minwu breaks the seal and does not rise. The Ultima Tome remains. Above the world, the Cyclone strikes. Learned Cyclone.');
  }
  if (npcId === 'cyclone-gate') {
    if (!state.flags.greenDragonDead && !state.flags.ricardDead) return say(state, 'The gate still holds. Something vast nests beyond it.');
    removeFromPlay(state, 'ricard', true);
    state.flags.ricardDead = true;
    setPhase(state, 'after-cyclone');
    return say(state, 'Ricard plants his lance and stays. The gate takes him. He is gone from the party. The Emperor was never in this wind — he waits in Palamecia.');
  }
  if (npcId === 'gatrea-courier') {
    if (!state.flags.joinedRebellion) return say(state, 'The courier will not trust an outsider.');
    if (state.flags.courierComplete) return say(state, 'The dispatch arrived. Gatrea owes you.');
    if (!state.flags.courierStarted) {
      state.flags.courierStarted = true;
      addItem(state, 'sealed-dispatch', 1);
      return say(state, 'A side errand, not the war: carry this sealed dispatch to Altair\'s quartermaster. The main road is watched.');
    }
    return say(state, 'The quartermaster is in Altair.');
  }
  if (npcId === 'quartermaster') {
    if (countItem(state, 'sealed-dispatch') <= 0) return say(state, 'The quartermaster counts bandages and waits.');
    takeItem(state, 'sealed-dispatch', 1);
    addItem(state, 'rebel-armband', 1);
    state.gil += 150;
    state.flags.courierComplete = true;
    return say(state, 'The quartermaster breaks the seal and pays you 150 gil and a Rebel Armband. "Not a medal. It keeps you harder to hit."');
  }
  if (keyword) return say(state, `They have nothing new to say about ${KEYWORD_LABEL[keyword]}.`);
  return say(state, 'They have nothing new to say.');
}

export function maybeSnowFarewell(state: GameState): void {
  if (!state.mapId.startsWith('snow-')) return;
  if (state.flags.josefDead) return;
  if (!state.party.some((c) => c.id === 'josef')) return;
  if (countItem(state, 'goddess-bell') <= 0) return;
  if (!state.flags.borghenDefeated) return;
  removeFromPlay(state, 'josef', true);
  state.flags.josefDead = true;
  setPhase(state, 'after-josef');
  note(state, 'A boulder seals the snow passage. Josef holds it. "Run." The stone comes down. Josef does not follow.');
}

export function onEnter(state: GameState, locationId: string): void {
  if (locationId === 'kashuan-keep' && state.flags.kashuanOpened && ['after-josef', 'to-snow', 'to-kashuan'].includes(state.phase)) {
    setPhase(state, 'to-kashuan');
  }
  if (locationId === 'castle-palamecia' && ['after-cyclone', 'to-palamecia'].includes(state.phase)) {
    setPhase(state, 'to-palamecia');
    if (!state.party.some((c) => c.id === 'leon')) {
      if (state.party.some((c) => c.id === 'gordon')) moveGuestToReserve(state, 'gordon');
      if (state.party.some((c) => c.id === 'leila')) moveGuestToReserve(state, 'leila');
      takeGuest(state, 'leon', makeLeonEndgame);
      state.flags.leonJoined = true;
      note(state, 'Leon is waiting in the gatehouse. The black armor is on the floor. He will fight the Emperor with you.');
    }
  }
  if (locationId === 'jade-passage') {
    state.flags.jadeOpened = true;
    if (state.phase === 'to-jade' || state.phase === 'after-emperor') setPhase(state, 'pandaemonium');
  }
}

export function onVictory(state: GameState, encounterId: string): void {
  if (encounterId === 'sergeant') state.flags.sergeantDefeated = true;
  if (encounterId === 'borghen') state.flags.borghenDefeated = true;
  if (encounterId === 'pirates') {
    state.flags.piratesDefeated = true;
    state.phase = 'leviathan';
    state.objective = 'The Leviathan has swallowed the ship. Find a way out.';
    state.mapId = 'leviathan-1';
    state.x = MAPS['leviathan-1'].spawn.x;
    state.y = MAPS['leviathan-1'].spawn.y;
    note(state, 'The crew\'s ambush fails. Before Leila can apologize twice, the Leviathan swallows the ship.');
  }
  if (encounterId === 'roundworm') {
    state.flags.leviathanCleared = true;
    state.vehicles.ship = true;
    state.ride = 'foot';
    state.mapId = 'paloom';
    state.x = TOWN_SPOTS.spawn.x;
    state.y = TOWN_SPOTS.spawn.y;
    state.worldX = 6;
    state.worldY = 24;
    setPhase(state, 'after-leviathan');
    if (!state.party.some((c) => c.id === 'gordon')) {
      if (state.party.some((c) => c.id === 'leila')) moveGuestToReserve(state, 'leila');
      takeGuest(state, 'gordon', makeGordon);
    }
    note(state, 'You cut free of the Leviathan with a ship of your own. Gordon meets you: the Coliseum is offering a princess.');
  }
  if (encounterId === 'lamia-queen') {
    state.flags.lamiaDefeated = true;
    setPhase(state, 'after-lamia');
    note(state, 'The princess sheds her face. A Lamia Queen. Hilda was never the prize.');
  }
  if (encounterId === 'gottos') {
    state.flags.gottosDefeated = true;
    note(state, 'Gottos falls. The cells are still below.');
  }
  if (encounterId === 'green-dragon') {
    state.flags.greenDragonDead = true;
    note(state, 'The dragon crashes through the Cyclone\'s ribs. The gate is failing.');
  }
  if (encounterId === 'emperor') {
    state.flags.emperorDefeated = true;
    learnKeyword(state, 'jade-passage');
    if (state.party.some((c) => c.id === 'leila')) moveGuestToReserve(state, 'leila');
    if (state.party.some((c) => c.id === 'gordon')) moveGuestToReserve(state, 'gordon');
    takeGuest(state, 'leon', makeLeonEndgame);
    state.flags.leonJoined = true;
    setPhase(state, 'after-emperor');
    note(state, 'The Emperor of Palamecia falls. Leon steps out of the dark armor and does not raise the sword. "He will climb back through the Jade Passage." Learned Jade Passage.');
  }
  if (encounterId === 'dark-emperor') {
    state.flags.darkEmperorDefeated = true;
    state.flags.leonRedeemed = true;
    state.endingText = 'The Emperor of Palamecia is destroyed, in the world and again in Pandaemonium. The Cyclone is broken. Fynn is free. Leon stands with Firion, Maria, and Guy, the dark sword laid on the stone. He is no longer the Dark Knight. The oath sworn in Altair holds. The Wild Rose lives.';
    setPhase(state, 'ending');
    state.mode = 'ending';
    note(state, state.endingText);
  }
  if (encounterId === 'red-soul') state.flags.kashuanClear = true;
  if (encounterId === 'thunder-gigas') state.flags.towerGuarded = true;
}

export function storyBattleBlock(state: GameState, encounterId: string): string | null {
  if (encounterId === 'gottos' && !state.flags.paulFynnGate) return 'Paul has not opened the drainage gate.';
  if (encounterId === 'emperor' && !['to-palamecia', 'after-cyclone'].includes(state.phase) && !state.flags.emperorDefeated) {
    return 'The throne is not yours to challenge yet.';
  }
  return null;
}

export function sail(state: GameState): ActionResult {
  if (state.phase !== 'to-leila' || !state.party.some((c) => c.id === 'leila')) {
    return fail('not-yet', 'You have no voyage prepared.');
  }
  state.mapId = 'tropical-2';
  state.x = MAPS['tropical-2'].spawn.x;
  state.y = MAPS['tropical-2'].spawn.y;
  state.flags.voyageStarted = true;
  note(state, 'Leila\'s ship makes the tropical island. Her crew is waiting, and they are not a welcome.');
  beginBattle(state, 'pirates');
  return ok(['The crew turns on you.']);
}

export function useFieldItem(state: GameState, itemId: string, targetId?: string): ActionResult {
  if (state.battle && itemId !== 'sunfire') return fail('in-battle', 'Use the battle command for items.');
  if (itemId === 'sunfire') {
    if (!state.mapId.startsWith('dreadnought')) return fail('too-far', 'Sunfire must be used on the Dreadnought\'s engine.');
    if (!takeItem(state, 'sunfire', 1)) return fail('no-item', 'You do not have Sunfire.');
    state.flags.sunfireUsed = true;
    state.flags.dreadnoughtDestroyed = true;
    note(state, 'Sunfire takes the engine apart. A knight in black walks out of the fire.');
    beginBattle(state, 'dark-knight');
    return ok(['Sunfire strikes. The Dark Knight appears.']);
  }
  if (itemId === 'ultima-tome') {
    if (!state.keywords.includes('ultima-tome')) return fail('unlearned-keyword', 'You cannot read a tome you do not have the words for.');
    if (!state.flags.ultimaLearnable) return fail('sealed', 'The tome is still sealed.');
    const learner = state.party.find((c) => c.id === (targetId ?? 'maria')) ?? state.party[0];
    if (!learner.spells.includes('ultima')) learner.spells.push('ultima');
    if (!learner.skills.ultima) learner.skills.ultima = { rank: 1, progress: 0 };
    state.flags.ultimaLearned = true;
    note(state, `${learner.name} learns Ultima.`);
    return ok([`${learner.name} learns Ultima.`]);
  }
  if (itemId.startsWith('tome-')) {
    const spellId = itemId.slice(5);
    if (!SPELL_BY_ID[spellId]) return fail('no-item', 'That tome is blank.');
    if ((state.items[itemId] ?? 0) <= 0) return fail('no-item', 'You do not have that tome.');
    const learner = state.party.find((c) => c.id === (targetId ?? 'maria')) ?? state.party.find((c) => !c.dead);
    if (!learner) return fail('no-one', 'No one can study.');
    takeItem(state, itemId, 1);
    if (!learner.spells.includes(spellId)) learner.spells.push(spellId);
    if (!learner.skills[spellId]) learner.skills[spellId] = { rank: 1, progress: 0 };
    note(state, `${learner.name} learns ${SPELL_BY_ID[spellId].name}.`);
    return ok([`${learner.name} learns ${SPELL_BY_ID[spellId].name}.`]);
  }
  const item = GEAR_BY_ID[itemId];
  if (!item) return fail('no-item', 'You do not have that.');
  if ((state.items[itemId] ?? 0) <= 0) return fail('no-item', 'You do not have that.');
  const target = state.party.find((c) => c.id === targetId) ?? state.party.find((c) => !c.dead);
  if (!target) return fail('no-one', 'No one to use it on.');
  if (item.effect === 'field-full') {
    takeItem(state, itemId, 1);
    for (const c of state.party) if (!c.dead) {
      c.hp = c.maxHp;
      c.mp = c.maxMp;
    }
    return say(state, 'The cottage restores the living.');
  }
  if (item.effect?.startsWith('heal-') && !target.dead) {
    takeItem(state, itemId, 1);
    const amount = Number(item.effect.slice(5));
    target.hp = Math.min(target.maxHp, target.hp + amount);
    return say(state, `${target.name} recovers.`);
  }
  if (item.effect === 'cure-death' || itemId === 'phoenix-down') {
    if (!target.dead && !state.fallen.includes(target.id)) return fail('not-dead', 'They are not dead.');
    if (state.fallen.includes(target.id)) return fail('story-dead', 'This death will not lift.');
    takeItem(state, itemId, 1);
    target.dead = false;
    target.hp = Math.max(1, Math.floor(target.maxHp * 0.2));
    target.statuses = target.statuses.filter((s) => s.id !== 'death');
    return say(state, `${target.name} stirs.`);
  }
  return fail('not-now', 'That is used in battle, or not at all.');
}

export function advancePalamecia(state: GameState): ActionResult {
  if (state.phase !== 'after-cyclone' && !state.flags.ricardDead) return fail('not-yet', 'The Cyclone still stands.');
  setPhase(state, 'to-palamecia');
  return say(state, 'The airship turns toward Castle Palamecia.');
}

export function dismissChocobo(state: GameState): ActionResult {
  return dismountChocobo(state);
}
