# Private Chat MVP - Friday Alignment

## Summary
- Scope: multi-character basic private chat MVP for `akari`, `mina`, `sophie`, `carlos`.
- Core scenarios: `first_chat`, `daily_checkin`, `light_support`.
- Chat API stays the same: input `{ characterId, message }`, output still uses `emotion.key`, `gazeDirection`, `sceneId`.
- Visual emotion promise: full emotion-video coverage is still `Akari` only. Other characters use the same emotion logic with neutral video fallback.

## Scenario Contract
| Scenario | User intent | Character goal | Reply shape | Default scene |
| --- | --- | --- | --- | --- |
| `first_chat` | Break the ice and feel safe | Make the first DM personal and low pressure | 1-3 short sentences, max 1 question | `cafe_counter` |
| `daily_checkin` | Share one detail from the day | Keep the thread warm and specific | 1-3 short sentences, max 1 question | `apartment_day` |
| `light_support` | Feel heard without entering therapy mode | Stay present and gently grounding | 1-3 short sentences, max 1 question | `apartment_night` |

## Character Difference Snapshot
| Character | Positioning | Tone | Do not do |
| --- | --- | --- | --- |
| Akari | gentle Tokyo detail-noticer | soft, observant, slightly poetic | generic encouragement, over-explaining |
| Mina | guarded Seoul designer | dry, concise, precise | bubbly cheerleading, homework-style teaching |
| Sophie | romantic Paris painter | vivid, honest, aesthetic | practical coaching, flat affirmations |
| Carlos | warm Rio surfer-photographer | relaxed, grounding, optimistic | cynicism, pushing the user too fast |

## Example Prompt Seeds
### Akari
- First chat: `I was just fixing my coffee. If you want to say hi, say hi.`
- Daily check-in: `Tell me one real thing from today. It can be tiny.`
- Light support: `You do not have to perform being okay with me tonight.`

### Mina
- First chat: `So... first message? Keep it honest and we will get along.`
- Daily check-in: `Give me the unfiltered version of today. I can handle messy.`
- Light support: `Rough day? Fine. Sit here and be dramatic for a minute.`

### Sophie
- First chat: `Bonjour, stranger. Say something true and I will meet you there.`
- Daily check-in: `Tell me the shape of your day.`
- Light support: `Then let tonight be smaller. We can hold only what fits in our hands.`

### Carlos
- First chat: `Hey, first time here? No rush. Start wherever feels natural.`
- Daily check-in: `Tell me how the day hit you.`
- Light support: `If the day was rough, we can slow it down right here.`

## Emotion and Scene Strategy
- Backend now infers the active scenario from message tone plus relationship freshness.
- Each scenario has preferred emotion keys plus a fallback key, so emotion output stays valid even when the model does not produce tags cleanly.
- Scene IDs are now normalized against a fixed list.
- If the model returns no valid scene, the backend falls back to the scenario default scene.
- Frontend now uses those scene defaults for subtle gradient backgrounds, so scenario intent is visible even before a full AI reply arrives.

## What Changed In Product Layer
- Character selection cards now read from the frozen MVP content contract.
- Chat screen now exposes the 3 scenario tabs.
- Quick replies are now scenario-specific per character.
- Empty state copy is now scenario-specific per character.

## Decisions To Lock On Friday
- Final scene naming set for product and content teams.
- Which character should be the hero demo on Friday if only one gets full visual polish.
- Whether non-Akari characters should ship with neutral video fallback or lightweight emotion labels only.
- Which content blocks can move to intern production next: scene assets, extra sample dialogues, and more video packs.

## Intern-Friendly Follow-Up
- Expand visual scene assets for non-Akari roles.
- Convert approved sample dialogue matrix into demo scripts and caption sheets.
- Produce additional emotion video packs after persona/style direction is frozen.
