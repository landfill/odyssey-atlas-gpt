import { chapters, parallelStories, type Chapter } from './chapters';
import type { Language } from './language';

type ChapterCopy = Pick<Chapter, 'title' | 'place' | 'theme' | 'subtitle' | 'summary' | 'cause' | 'conflict' | 'consequence' | 'next' | 'moment'> & {
  hotspots: { title: string; text: string }[];
};

const copy: Record<string, ChapterCopy> = {
  troy: {
    title: 'Troy', place: 'Troy', theme: 'The war ends. The voyage begins.',
    subtitle: 'Beyond the burning walls,\nthe sea leads home.',
    summary: 'The war is over. Yet even the victors must find their way home. Odysseus’s fleet leaves the shores of Troy.',
    cause: 'After years of war, the task that remains is to return to Ithaca.',
    conflict: 'Will the cunning that survived the war also carry him across the sea?',
    consequence: 'Leaving the conquered city behind, the fleet heads toward unfamiliar shores.',
    next: 'The first port of call: Ismarus, city of the Cicones.',
    moment: 'Fire along the walls and the departing fleet',
    hotspots: [
      { title: 'The Trojan Horse', text: 'The horse symbolizes wartime cunning. This voyage asks whether the cleverness that wins a war is also the wisdom needed to return home.' },
      { title: 'The Fallen Walls', text: 'The city marks the end of war; the sea holds trials yet to begin. The flames and ash-gray palette are a visual interpretation created for this app.' },
      { title: 'The Homeward Fleet', text: 'Several ships travel together at first. Their presence sets up the contrast with the fleet’s destruction and the solitary voyage to come.' }
    ]
  },
  ismaros: {
    title: 'Ismarus', place: 'Ismarus', theme: 'The cost of the first landing',
    subtitle: 'A moment longer on shore,\nand home slips farther away.',
    summary: 'After leaving Troy, the fleet clashes with the Cicones. An unfamiliar coast becomes a battlefield to escape, rather than a brief place of rest.',
    cause: 'The fleet reaches its first coastal city after the war.',
    conflict: 'Treat this new land as another battlefield, or withdraw for the sake of home?',
    consequence: 'A hurried departure follows the clash. The journey home bears its first losses.',
    next: 'The land of the Lotus-Eaters, where the very wish to return can fade.',
    moment: 'A ship pulling away from the broken defenses',
    hotspots: [
      { title: 'The Coastal City', text: 'The clustered houses and broken defenses show how the habits of war follow the travelers into their journey home.' },
      { title: 'A Hurried Departure', text: 'Remaining in the harbor increases the danger. The ship’s movement recreates the retreat from shore after the clash.' }
    ]
  },
  lotus: {
    title: 'Land of the Lotus-Eaters', place: 'Lotus-Eaters', theme: 'A destination forgotten',
    subtitle: 'Nothing here is frightening.\nEven home is no longer missed.',
    summary: 'This temptation carries no weapon. In the land of the lotus, the desire to return home grows faint. To continue, the travelers must escape a comforting oblivion.',
    cause: 'After the conflict on the coast, a tranquil land appears.',
    conflict: 'Remain in this peace, or remember home even when remembering hurts?',
    consequence: 'Odysseus renews the resolve to return and takes to the sea again.',
    next: 'The search for food and shelter leads to an enormous cave.',
    moment: 'Slow mist drifting around the lotus flowers',
    hotspots: [
      { title: 'The Lotus Grove', text: 'The lotus symbolizes the temptation to forget the journey home. This scene does not identify a particular botanical species.' },
      { title: 'The Dreamlike Shore', text: 'Soft light and lingering mist give oblivion a physical form. This beauty is also the danger that could bring the voyage to a halt.' }
    ]
  },
  cyclops: {
    title: 'The Cave of Polyphemus', place: 'Polyphemus', theme: 'Cunning and pride',
    subtitle: 'They survived the cave.\nHis name stayed on the sea.',
    summary: 'Trapped in a vast cave, the travelers devise a clever escape. But the pride that seeks to proclaim their success brings a price to be paid at sea.',
    cause: 'Leaving the shore of forgetfulness, the travelers enter an unfamiliar cave.',
    conflict: 'Conceal an identity to survive, or reveal a name after victory?',
    consequence: 'The escape succeeds, but the cost of pride hangs over the rest of the voyage.',
    next: 'Aeolus, keeper of the winds, offers a chance to reach home.',
    moment: 'The cave entrance and the sheep’s escape route',
    hotspots: [
      { title: 'The One-Eyed Giant', text: 'The giant towers over the sheep and ship. The scene emphasizes scale and confinement rather than graphic violence.' },
      { title: 'The Blocking Stone', text: 'The boulder seals the entrance. Move through the scene to see how the doorway relates to the escape route.' },
      { title: 'The Path of the Sheep', text: 'A lower viewpoint reveals a small escape route inside the enormous space. Cunning turns overwhelming strength against itself.' }
    ]
  },
  aeolus: {
    title: 'The Island of Aeolus', place: 'Aeolus', theme: 'The seal is broken',
    subtitle: 'The wind that carried them home\nturns them back out to sea.',
    summary: 'The bag of winds was a gift that could make homecoming possible. When its seal is broken, the winds drive the ship back, and home recedes once more.',
    cause: 'After the cave, the travelers receive help on the island of the winds.',
    conflict: 'Trust in the promise of homecoming, or give in to suspicion about the sealed bag?',
    consequence: 'The released winds undo the chance of return. The route loops back to the same island.',
    next: 'The return visit appears as a looping route rather than a separate chapter. The giants’ harbor comes next.',
    moment: 'Winds spreading from the opened seal',
    hotspots: [
      { title: 'The Bag of Winds', text: 'A sealed promise becomes a storm when opened. Select the bag or advance the scene to explore both states.' },
      { title: 'The Bronze Walls', text: 'The enclosed island and the sealed bag form a shared visual motif of containment and release.' },
      { title: 'The Returning Route', text: 'The ship that once approached home returns to this island. The dotted loop marks the repeated visit, not a measured geographical distance.' }
    ]
  },
  giants: {
    title: 'The Laestrygonian Harbor', place: 'Laestrygonians', theme: 'A harbor becomes a trap',
    subtitle: 'The bay that promised shelter\nbecomes a wall around the fleet.',
    summary: 'High cliffs surround a narrow harbor. What looks like a refuge becomes a trap when the giants attack and the fleet struggles to escape.',
    cause: 'Having lost their chance of homecoming, the fleet anchors in another harbor.',
    conflict: 'Try to protect the fleet, or survive through the narrow exit?',
    consequence: 'The fleet is destroyed. The remaining voyage centers on a single ship.',
    next: 'The surviving ship reaches Aeaea, an island of forest and magic.',
    moment: 'Falling rocks and broken ships in the harbor',
    hotspots: [
      { title: 'The Narrow Bay', text: 'The deeply sheltered coast and high cliffs suggest both protection and confinement.' },
      { title: 'The Giant’s Rock', text: 'The rock changes position as the scene advances, revealing the geometry of the attack without depicting graphic injuries.' },
      { title: 'The Fleet’s Remains', text: 'After this event, the companion ships disappear from the map. One ship carries the journey forward.' }
    ]
  },
  circe: {
    title: 'Circe’s Aeaea', place: 'Aeaea', theme: 'Transformation and respite',
    subtitle: 'In a palace among the trees,\nthey learn the road ahead.',
    summary: 'On Circe’s island, the boundary between human and animal shifts. After the threat of transformation, the stay becomes a time to prepare for the next journey.',
    cause: 'The survivors of the fleet’s destruction approach a palace in the forest.',
    conflict: 'Find a way forward without losing human form amid this enchanting welcome.',
    consequence: 'After transformation and a period of rest, they prepare to approach the realm of the dead.',
    next: 'They will return here after visiting the dead. A looping route marks that return.',
    moment: 'A silhouette between human and animal',
    hotspots: [
      { title: 'The Enchanted Cup', text: 'Advance the scene to watch the figure beside the cup take an animal silhouette. Magic appears through changes in color and form.' },
      { title: 'The Herb Garden', text: 'The garden and forest provide a visual language for the island’s magic. No particular herb species or properties are asserted.' },
      { title: 'The Forest Palace', text: 'A stay need not mean the journey has stopped. See the palace doors and steps as a place of preparation for what comes next.' }
    ]
  },
  hades: {
    title: 'The Edge of the Underworld', place: 'The Underworld', theme: 'Voices of the dead',
    subtitle: 'At waters beyond the light,\nthe road ahead is spoken.',
    summary: 'Across dark waters, a living traveler meets the dead. Returning home means more than choosing a course: it means facing the cost still to come.',
    cause: 'The journey prepared on Circe’s island leads to the boundary of the underworld.',
    conflict: 'Can the voyage continue after hearing warnings one would rather not know?',
    consequence: 'Prophecy and encounters offer clues to the trials ahead.',
    next: 'Back to Circe’s island, then on to the Sirens. A secondary dotted line marks the intervening return.',
    moment: 'Spirits appearing above the dark water',
    hotspots: [
      { title: 'The Dark Water', text: 'The water’s color and pale terrain interpret the boundary between life and death. They do not indicate a verified geographical location.' },
      { title: 'The Fading Spirits', text: 'Forms emerge without becoming fully tangible. Scene progress reveals the distance between the living visitor and the dead.' }
    ]
  },
  sirens: {
    title: 'The Sea of the Sirens', place: 'Sirens', theme: 'To hear without following',
    subtitle: 'One direction calls in song.\nAnother must guide the ship.',
    summary: 'Hearing temptation is different from following it. A figure bound to the mast and a ship still moving forward show a choice to acknowledge desire while limiting action.',
    cause: 'Carrying the warnings with them, the travelers enter the Sirens’ waters.',
    conflict: 'The desire to experience temptation meets the resolve to preserve the journey home.',
    consequence: 'Within chosen restraints, the ship passes the rocks and continues.',
    next: 'In the next strait, even a deliberate choice cannot prevent all loss.',
    moment: 'The mast’s ropes and the ripples of temptation',
    hotspots: [
      { title: 'Sirens on the Rocks', text: 'Sound appears only as thin ripples. The app plays no audio; these waves visually suggest the direction of temptation.' },
      { title: 'Bound to the Mast', text: 'A freely chosen restraint preserves the ship’s course when resolve might fail. Zoom in to inspect the mast and ropes.' }
    ]
  },
  strait: {
    title: 'Scylla and Charybdis', place: 'Scylla & Charybdis', theme: 'An unavoidable loss',
    subtitle: 'There is no passage here\nthat keeps everything safe.',
    summary: 'A monster waits on one cliff; a whirlpool swallows the sea on the other side. The ship must pass between them. This choice concerns the loss one must bear, rather than victory.',
    cause: 'After the Sirens, the ship enters a narrow strait.',
    conflict: 'Choose a way forward between different forms of disaster.',
    consequence: 'No passage is entirely safe. The travelers carry their losses to the next island.',
    next: 'A sacred prohibition awaits them on the island of the Sun.',
    moment: 'Ship, monster and whirlpool changing together',
    hotspots: [
      { title: 'Scylla’s Cliff', text: 'The monster overlooks the narrow passage from a high cliff. Use the slider to explore the changing distance between ship and monster.' },
      { title: 'The Depths of Charybdis', text: 'Waves at different heights sink toward the center. Scene progress changes both the whirlpool’s depth and the ship’s position.' },
      { title: 'The Remaining Passage', text: 'The controls let you examine the event. They do not change the epic’s outcome or offer a route without loss.' }
    ]
  },
  sun: {
    title: 'The Island of the Sun', place: 'Thrinacia', theme: 'The cost of a broken taboo',
    subtitle: 'A sacred boundary is crossed.\nThe sea takes everything back.',
    summary: 'Sacred cattle live on the island. Prolonged hardship weakens the resolve to respect a prohibition, and its violation leads to shipwreck and disaster.',
    cause: 'After the losses in the strait, the travelers stay on another island.',
    conflict: 'Immediate need clashes with a prohibition that must be honored.',
    consequence: 'After the taboo is broken, shipwreck brings the voyage to ruin.',
    next: 'On the isolated paradise of Ogygia, the struggle between staying and returning continues.',
    moment: 'Sacred cattle and a darkening horizon',
    hotspots: [
      { title: 'The Sacred Cattle', text: 'The apparently plentiful cattle are not a resource the travelers may freely take. The chapter centers on a prohibition and its violation.' },
      { title: 'The Sun’s Emblem', text: 'The circular mark on stone is a newly designed symbol that conveys the sacred character of this place.' },
      { title: 'Traces of Shipwreck', text: 'Later in the scene, wreckage replaces the intact ship, setting up a contrast with the raft of the next chapter.' }
    ]
  },
  calypso: {
    title: 'Calypso’s Ogygia', place: 'Ogygia', theme: 'To stay or to return',
    subtitle: 'Even paradise\ncannot take the place of home.',
    summary: 'Time passes in an isolated paradise. However beautiful a place may be, the longing for home remains. A raft begins moving toward the horizon.',
    cause: 'After the shipwreck, the voyage becomes a stay on an isolated island.',
    conflict: 'Remain in present comfort, or face the dangerous sea again?',
    consequence: 'He chooses departure and homecoming over staying.',
    next: 'Toward the Phaeacians, who offer welcome and assistance.',
    moment: 'A raft leaving the cave for the horizon',
    hotspots: [
      { title: 'An Isolated Paradise', text: 'Lush vegetation surrounds a cave open on one side. Beauty and isolation inhabit the same place.' },
      { title: 'A Raft for the Horizon', text: 'This vessel differs from the fleet at the journey’s beginning. Its form reveals what the voyage has done to the traveler.' }
    ]
  },
  scheria: {
    title: 'Scheria of the Phaeacians', place: 'Scheria', theme: 'Hospitality opens a way',
    subtitle: 'The kindness of strangers\ncarries him across the final sea.',
    summary: 'This harbor is no trap. Here, hospitality brings help for the journey home. After so many trials, the voyage finally finds a path to Ithaca.',
    cause: 'Leaving paradise, he crosses the sea again and reaches an inhabited land.',
    conflict: 'Move beyond caution and mistrust to accept the welcome of others.',
    consequence: 'A homeward ship is prepared, making the passage to Ithaca possible.',
    next: 'Even on Ithaca, he cannot immediately reveal who he is.',
    moment: 'A bright harbor and the homeward ship',
    hotspots: [
      { title: 'The Welcoming Court', text: 'Open columns and pale stone replace closed walls, giving this place the character of hospitality and help.' },
      { title: 'The Homeward Ship', text: 'A ship provided by his hosts crosses the final sea. Notice the change from a raft back to a complete vessel.' }
    ]
  },
  ithaca: {
    title: 'Return to Ithaca', place: 'Ithaca', theme: 'A name still hidden',
    subtitle: 'He has reached home.\nNow he must reclaim himself.',
    summary: 'Odysseus reaches a misty shore. The sea journey is over, but his identity remains to be restored. He returns cautiously along the path to the palace.',
    cause: 'With help from Scheria, he finally reaches the shores of his homeland.',
    conflict: 'Reveal himself at once, or study what has changed before completing his return?',
    consequence: 'Keeping his identity hidden, he encounters a changed homeland and palace.',
    next: 'The trial of the bow and a reunion will restore his name and his place in the family.',
    moment: 'Coastal mist and the path to the palace',
    hotspots: [
      { title: 'The Misty Shore', text: 'The sea journey ends here. In the next chapter, the ship stays on this coast while the camera moves into the palace.' },
      { title: 'The Path to the Palace', text: 'Stone steps and a narrow path connect shore and home. Arrival and the recovery of identity are distinct moments.' },
      { title: 'Waiting in Ithaca', text: 'Penelope’s weaving and the pressure of the suitors unfold beyond the voyage. Explore the companion stories below.' }
    ]
  },
  reunion: {
    title: 'The Bow and the Reunion', place: 'Ithaca’s Palace', theme: 'Reclaiming a name and a home',
    subtitle: 'At the end of the long route,\nthe returning traveler is known.',
    summary: 'A bow, a loom and an olive tree fill the palace with meaning. After the trial that reveals his identity, he rejoins his family. The long sea route becomes a homecoming.',
    cause: 'After returning in disguise, the moment comes to reveal his name.',
    conflict: 'How does a returning traveler, now a stranger, recover his place?',
    consequence: 'Identity is restored and the family reunited. The sea warms with light, and the route is complete.',
    next: 'The story ends. Return to the full map to revisit the choices along the way.',
    moment: 'The tension of the bowstring and the arrow’s path',
    hotspots: [
      { title: 'The Trial of the Bow', text: 'The bow symbolizes the trial that reveals identity. Move the slider to draw the string and reveal the arrow’s path.' },
      { title: 'The Loom', text: 'Weaving represents a strategy for delaying time, rather than simply waiting. It connects to the companion story of Penelope in Ithaca.' },
      { title: 'The Olive Tree', text: 'Warm light and a deeply rooted tree bring the last scene to a close, without extravagant celebration effects.' }
    ]
  }
};

export const englishChapters: Chapter[] = chapters.map(chapter => {
  const translated = copy[chapter.id];
  const note = chapter.order === 1 ? ' / Chronological adaptation of the epic'
    : chapter.order === 5 ? ' / Includes the return visit'
    : chapter.order === 6 ? ' / Includes the changing fleet'
    : chapter.order === 7 ? ' / Includes the return from the underworld'
    : chapter.order === 8 ? ' / Includes the secondary route'
    : chapter.order === 14 ? ' / Companion stories are not synchronized to individual voyage events'
    : chapter.order === 15 ? ' / The palace interior is a visual interpretation' : '';
  return {
    ...chapter, ...translated,
    sourceRef: `Project brief · Chapter ${chapter.order}${note}`,
    hotspots: chapter.hotspots.map((hotspot, i) => ({ ...hotspot, ...translated.hotspots[i] }))
  };
});

const englishParallelStories: typeof parallelStories = {
  penelope: {
    title: 'Waiting in Ithaca', subtitle: 'Penelope · Weaving and delay',
    text: 'Penelope, left in the palace, also faces choices as time passes. Her weaving, the tension in the palace and the pressure of the suitors show that waiting is far from passive. The loom symbolizes a strategy for buying time and preserving her choices.'
  },
  telemachus: {
    title: 'In Search of a Father', subtitle: 'Telemachus · Searching and growing',
    text: 'Telemachus does not follow his father’s route. His search for his father is also a process of growing into a place of his own. This story runs alongside the voyage, without claiming that individual events occur at exactly the same time.'
  }
};

export const getChapters = (language: Language): Chapter[] => language === 'en' ? englishChapters : chapters;
export const getParallelStories = (language: Language): typeof parallelStories => language === 'en' ? englishParallelStories : parallelStories;
