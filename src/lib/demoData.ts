import { Memory } from '@/types/memory';

export const INITIAL_DEMO_MEMORIES: Memory[] = [
  {
    id: 'demo-abuela-elena',
    title: "Abuela Elena's Anise Bread & The November Altars",
    person: 'Elena Vasquez Morales',
    relationship: 'Maternal Grandmother (Abuela)',
    era: '1968 – 1994',
    place: 'Oaxaca, Mexico & Santa Ana, California',
    originalStory: 
`Every October 29th, the entire house started smelling of crushed toasted anise seeds and orange blossom water. Abuela Elena would tie her yellow embroidered apron and wake us before sunrise. 

She insisted that Pan de Muerto couldn't be hurried by electric mixers. She kneaded the dough on a huge mesquite wooden board my grandfather Mateo had carved for their wedding in 1952. Her knuckles were swollen with arthritis, but when her hands hit the warm dough, she moved like a conductor.

"The bones on top of the loaf," she would tell me as she rolled the crossed dough strips, "aren't to scare anyone. They are the four directions of the universe, and the little sphere on top is a tear shed for those who walked ahead of us."

When we placed the first loaf on the altar beside Mateo's photograph, she would pour a tiny jigger of Mezcal and set a glass of clear water. She told me: "They have travelled a great distance between stars, Megh. The dead are tired and thirsty. Always leave water before anything else." She passed away in the winter of 1994, but whenever I grind anise seeds, she is right beside me in the kitchen.`,
    isDemo: true,
    createdAt: '2026-10-27T14:30:00Z',
    updatedAt: '2026-10-27T14:30:00Z',
    portrait: {
      suggestedTitle: "The Scent of Anise: Elena's Pan de Muerto Tradition",
      summary: "A vivid remembrance of Abuela Elena baking traditional Day of the Dead anise bread by hand on her carved 1952 mesquite board, imparting ancestral symbolism and quiet love.",
      remembrance: "Elena's kitchen was not merely a place of sustenance, but a sanctuary of remembrance. Through the patient folding of dough and the sacred geometry of bread bones, she built an enduring bridge between the living and those who walked ahead.",
      rewrittenNarrative: "Between the pre-dawn stillness of late October and the fragrance of toasted anise and orange blossom water, Elena Vasquez Morales conducted a sacred family ritual. Working upon a mesquite board carved in 1952 by her husband Mateo, she kneaded without hurry, defying arthritis with ancestral purpose.\n\nShe taught that the dough bones atop each loaf marked the four compass directions of the cosmos, capped by a sphere representing a tear of remembrance. In her wisdom, hospitality transcended mortality: the traveler between stars received clear water before all else.",
      people: ['Elena Vasquez Morales (Abuela)', 'Mateo (Grandfather)'],
      places: ['Oaxaca, Mexico', 'Santa Ana, California'],
      events: ['Annual Day of the Dead Preparation (October 29)', 'Marriage of Elena and Mateo (1952)'],
      timeline: [
        { dateOrEra: '1952', event: 'Mateo carves the mesquite kneading board as a wedding gift.' },
        { dateOrEra: 'October 29 (Annual)', event: 'Dawn baking of Pan de Muerto with anise and orange blossom water.' },
        { dateOrEra: 'November 1-2', event: 'Setting the altar with fresh bread, clear water, and Mateo’s photograph.' },
        { dateOrEra: 'Winter 1994', event: 'Passing of Abuela Elena.' }
      ],
      themes: ['Ancestral Tradition', 'Día de los Muertos', 'Culinary Heritage', 'Grief & Enduring Love'],
      tags: ['abuela', 'baking', 'altar', 'oaxaca', 'day-of-the-dead', 'tradition'],
      followUpQuestions: [
        'Did Abuela Elena ever share where she learned her specific recipe for the orange blossom water?',
        'What happened to the carved mesquite board Mateo made in 1952?',
        'Are there specific songs or prayers she murmured while the bread was in the oven?'
      ],
      modelUsed: 'Gemma 3 (4B) / Curated Benchmark Demo',
      generatedAt: '2026-10-27T14:32:00Z',
      status: 'completed'
    }
  },
  {
    id: 'demo-grandpa-arthur',
    title: "Grandpa Arthur's Shortwave Radio in the Attic",
    person: 'Arthur William Pendelton',
    relationship: 'Paternal Grandfather',
    era: 'Winter 1974',
    place: 'Manchester, England',
    originalStory: 
`In the winter of 1974, during the three-day working week and rolling power cuts in England, my Grandpa Arthur retreated to the attic. He had wired a pair of heavy lead-acid car batteries to an old valve-driven Eddystone shortwave communications receiver.

The room smelled of solder, damp wool, and pipe tobacco. He wore fingerless grey wool mittens and large bakelite headphones. While the street below was blacked out in freezing rain, the green phosphorescent dial of the radio glowed in the dark like an emerald eye.

He would slowly turn the heavy weighted vernier dial, pulling voices out of the static: ship-to-shore Morse code from trawlers in the North Sea, Radio Tirana, jazz from Voice of America, and faint French accordion music from Paris.

He let me turn the fine-tuning knob. "Listen close," he whispered. "The ionosphere bounces these waves off the edge of space. We are eavesdropping on the sky." He never talked much about his years in the merchant navy during the war, but that attic was where he touched the world beyond our damp brick terrace.`,
    isDemo: true,
    createdAt: '2026-10-28T09:15:00Z',
    updatedAt: '2026-10-28T09:15:00Z',
    portrait: {
      suggestedTitle: "Eavesdropping on the Sky: Arthur's Attic Sanctuary",
      summary: "During the 1974 British power blackouts, Grandpa Arthur powered a vintage shortwave radio from car batteries in his freezing attic, teaching his grandchild to hear the world through the static.",
      remembrance: "Arthur's attic was a luminous pocket of quiet resistance against the darkness of the 1974 power cuts. In the green glow of a vacuum-tube dial, he bestowed a lifelong sense of wonder—that beyond every silence, human voices are traveling across the night.",
      rewrittenNarrative: "Amid the winter darkness of the 1974 Three-Day Week in Manchester, Arthur William Pendelton created a quiet constellation in his attic. Powered by salvaged car batteries, his Eddystone valve receiver cut through freezing rain and rolling blackouts.\n\nIn a room steeped in pipe tobacco and warm solder, the emerald glow of the radio dial illuminated his world. Guiding small hands to the brass fine-tuner, Arthur decoded the invisible pathways of the ionosphere, bridging merchant navy memories with the curious ears of his grandchild.",
      people: ['Arthur William Pendelton (Grandpa Arthur)'],
      places: ['Manchester, England', 'North Sea', 'Attic Workshop'],
      events: ['The 1974 British Three-Day Week Blackouts', 'Listening to North Sea trawler Morse transmissions'],
      timeline: [
        { dateOrEra: '1940s', event: 'Arthur serves in the Merchant Navy during WWII.' },
        { dateOrEra: 'Winter 1974', event: 'Attic radio sessions powered by car batteries during industrial power cuts.' }
      ],
      themes: ['Curiosity & Technology', 'Quiet Resilience', 'Post-War Britain', 'Intergenerational Bonding'],
      tags: ['grandpa', 'radio', 'shortwave', 'manchester', '1970s', 'audio'],
      followUpQuestions: [
        'Do you know what specific model the Eddystone receiver was?',
        'Did Arthur ever mention any specific ships he served on in the Merchant Navy?',
        'Did he keep a radio logbook of frequencies and stations logged in 1974?'
      ],
      modelUsed: 'Gemma 3 (4B) / Curated Benchmark Demo',
      generatedAt: '2026-10-28T09:18:00Z',
      status: 'completed'
    }
  },
  {
    id: 'demo-inisheer-cottage',
    title: 'The Peat Fire & The Salt Spray on Inisheer',
    person: 'Bridie Ní Flatharta',
    relationship: 'Great-Aunt',
    era: 'August 1991',
    place: 'Inisheer, Aran Islands, Ireland',
    originalStory: 
`We arrived by the old curragh ferry in a gale that turned Galway Bay the color of wet slate. Great-Aunt Bridie was standing on the slipway wearing a heavy black shawl pinned with a silver brooch shaped like a swan.

Her cottage had lime-washed stone walls two feet thick and a low roof thatched with rye straw and netted against the Atlantic storms. There was no television, no telephone. Water came from a rainwater cistern by the gable end.

At night, the only heat was dried sods of dark brown peat burning in the hearth with a sweet, ancient smoke that seeped into your hair and clothes for weeks afterward. Bridie spoke Irish to the sheepdog and English to us, but when she sang 'Caoineadh na dTrí Muire' (The Lament of the Three Marys) by the firelight, language didn't matter. Her voice was thin and reedy, but it held four hundred years of island wind.

Before we left, she pressed a smooth grey limestone pebble from the beach into my palm and said, 'Keep the cold stone in your pocket when you are far from home. It remembers where the land ends.'`,
    isDemo: true,
    createdAt: '2026-10-29T16:45:00Z',
    updatedAt: '2026-10-29T16:45:00Z',
    portrait: {
      suggestedTitle: 'Where the Land Ends: Bridie and the Aran Hearth',
      summary: 'A journey across stormy Galway Bay in 1991 to Great-Aunt Bridie’s thatched stone cottage on Inisheer, marked by peat smoke, traditional sean-nós song, and an island talisman.',
      remembrance: "Bridie was an anchor at the western edge of Europe. In her lime-washed cottage, warmed only by burning turf and ancestral song, she reminded all who crossed her threshold that a true home is carried not in brick or mortar, but in memory and song.",
      rewrittenNarrative: "Crossing Galway Bay through slate-grey squalls in August 1991 led to the stone slipway of Inisheer, where Bridie Ní Flatharta stood wrapped in black wool and silver. Her thatched cottage stood impervious to Atlantic gales, fragrant with the ancient, sweet perfume of burning turf.\n\nBeside the open hearth, Bridie sang ancient sean-nós laments that defied time and translation. Before departure, she gifted a smooth limestone pebble—a quiet talisman reminding the traveler where the land ends and memory begins.",
      people: ['Bridie Ní Flatharta (Great-Aunt)'],
      places: ['Inisheer, Aran Islands, Ireland', 'Galway Bay'],
      events: ['Summer visit to the Aran Islands (August 1991)', 'Ferry crossing by traditional curragh'],
      timeline: [
        { dateOrEra: 'August 1991', event: 'Family journey across Galway Bay to Inisheer.' },
        { dateOrEra: 'August 1991 (Evening)', event: 'Gathering by the peat fire; Bridie sings Caoineadh na dTrí Muire.' },
        { dateOrEra: 'August 1991 (Departure)', event: 'Bridie gifts the grey limestone talisman.' }
      ],
      themes: ['Island Heritage', 'Oral Tradition & Song', 'End of an Era', 'Gaelic Culture'],
      tags: ['ireland', 'aran-islands', 'music', 'folklore', 'great-aunt', 'cottage'],
      followUpQuestions: [
        'Do you still have the grey limestone pebble Bridie placed in your palm?',
        'Did Bridie ever leave Inisheer to visit the mainland during her later life?',
        'Did anyone in the family record her singing or speaking in Irish?'
      ],
      modelUsed: 'Gemma 3 (4B) / Curated Benchmark Demo',
      generatedAt: '2026-10-29T16:48:00Z',
      status: 'completed'
    }
  }
];

export const DEMO_ASK_SUGGESTIONS = [
  "What traditions did Abuela Elena pass down for Day of the Dead?",
  "Tell me about Grandpa Arthur's radio in 1974.",
  "What gift did Great-Aunt Bridie give before leaving Inisheer?",
  "What foods, smells, or sensory memories are preserved in the garden?"
];

export const DEMO_PRECOMPUTED_ANSWERS: Record<string, {
  answer: string;
  sources: { memoryId: string; title: string; person: string; era: string; excerpt: string }[];
}> = {
  "What traditions did Abuela Elena pass down for Day of the Dead?": {
    answer: "Abuela Elena celebrated Day of the Dead with deep reverence, centering her tradition on hand-kneading Pan de Muerto on a 1952 carved mesquite board using toasted anise seeds and orange blossom water. She explained that the dough bones on the loaf symbolize the four directions of the universe, and the top sphere is a tear for those who passed. Crucially, before setting out bread or Mezcal on the altar beside Mateo's photo, she always placed a glass of fresh water, reminding her family: 'The dead are tired and thirsty... Always leave water before anything else.'",
    sources: [
      {
        memoryId: 'demo-abuela-elena',
        title: "Abuela Elena's Anise Bread & The November Altars",
        person: 'Elena Vasquez Morales',
        era: '1968 – 1994',
        excerpt: "She kneaded the dough on a huge mesquite wooden board my grandfather Mateo had carved... 'The bones on top of the loaf aren't to scare anyone. They are the four directions of the universe...'"
      }
    ]
  },
  "Tell me about Grandpa Arthur's radio in 1974.": {
    answer: "During the 1974 British three-day working week and rolling power cuts in Manchester, Grandpa Arthur set up an attic retreat powered by heavy lead-acid car batteries. He used a valve-driven Eddystone shortwave communications receiver with an emerald-green phosphorescent dial. Wearing fingerless mittens and bakelite headphones in the freezing attic, he pulled in trawler Morse code from the North Sea, Radio Tirana, and music from Paris, teaching his grandchild that the ionosphere bounces radio waves off the edge of space.",
    sources: [
      {
        memoryId: 'demo-grandpa-arthur',
        title: "Grandpa Arthur's Shortwave Radio in the Attic",
        person: 'Arthur William Pendelton',
        era: 'Winter 1974',
        excerpt: "He had wired a pair of heavy lead-acid car batteries to an old valve-driven Eddystone shortwave communications receiver... 'The ionosphere bounces these waves off the edge of space. We are eavesdropping on the sky.'"
      }
    ]
  },
  "What gift did Great-Aunt Bridie give before leaving Inisheer?": {
    answer: "Before leaving her thatched stone cottage on Inisheer in August 1991, Great-Aunt Bridie pressed a smooth grey limestone pebble from the Atlantic beach into her visitor's palm. She accompanied it with the parting words: 'Keep the cold stone in your pocket when you are far from home. It remembers where the land ends.'",
    sources: [
      {
        memoryId: 'demo-inisheer-cottage',
        title: 'The Peat Fire & The Salt Spray on Inisheer',
        person: 'Bridie Ní Flatharta',
        era: 'August 1991',
        excerpt: "Before we left, she pressed a smooth grey limestone pebble from the beach into my palm and said, 'Keep the cold stone in your pocket when you are far from home. It remembers where the land ends.'"
      }
    ]
  },
  "What foods, smells, or sensory memories are preserved in the garden?": {
    answer: "The preserved memories hold rich, specific sensory details across three distinct archives:\n\n1. **Abuela Elena's Kitchen:** Crushed toasted anise seeds, orange blossom water, warm yeast dough, and mezcal.\n2. **Grandpa Arthur's Attic:** The scent of solder, damp wool, pipe tobacco, and the warm green glow of a vacuum-tube dial in a freezing blacked-out room.\n3. **Bridie's Island Cottage:** The sweet ancient smoke of burning dark brown peat turf, lime-washed stone walls, rain spray from Galway Bay, and the cold texture of a smooth limestone beach pebble.",
    sources: [
      {
        memoryId: 'demo-abuela-elena',
        title: "Abuela Elena's Anise Bread & The November Altars",
        person: 'Elena Vasquez Morales',
        era: '1968 – 1994',
        excerpt: "Every October 29th, the entire house started smelling of crushed toasted anise seeds and orange blossom water."
      },
      {
        memoryId: 'demo-grandpa-arthur',
        title: "Grandpa Arthur's Shortwave Radio in the Attic",
        person: 'Arthur William Pendelton',
        era: 'Winter 1974',
        excerpt: "The room smelled of solder, damp wool, and pipe tobacco."
      },
      {
        memoryId: 'demo-inisheer-cottage',
        title: 'The Peat Fire & The Salt Spray on Inisheer',
        person: 'Bridie Ní Flatharta',
        era: 'August 1991',
        excerpt: "At night, the only heat was dried sods of dark brown peat burning in the hearth with a sweet, ancient smoke..."
      }
    ]
  }
};
