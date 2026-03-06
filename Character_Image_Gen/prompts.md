# 情绪角色生成 - 提示词库

本文档包含工作流所需的全部预设提示词（Prompt 1-5），这些提示词在工作流中保持不变。

---

## Prompt 0（用户输入）

> **说明**: 这是用户每次运行时需要提供的提示词，描述原始中立人物图片的生成参数。
> 
> **用途**: 在步骤3（4K提升）中，结合此提示词还原人物细节，保持一致性。

**示例**:
```
A photorealistic portrait of a young Asian woman with long flowing black hair, 
fair skin, gentle almond-shaped eyes, wearing a white casual shirt, 
studio lighting, neutral expression, clean background, 8K quality
```

---

## Prompt 1 — 积极情绪25宫格

```
Use the provided reference image as the character identity to generate a 5×5 grid (25 images) of different POSITIVE emotions for the SAME character.

=== CHARACTER CONSISTENCY REQUIREMENTS ===
Keep IDENTICAL across all grid cells:
- Face structure and features
- Hairstyle and hair color
- Clothing and accessories
- Body proportions
- Art style and rendering
- Lighting direction
- Background (transparent)
- Camera framing (chest-up, upper body visible)

=== VARY ONLY THESE ELEMENTS ===
- Facial expression (muscle configuration)
- Eyebrow position and shape
- Eye openness and gaze direction
- Mouth shape and position
- Head tilt angle
- Subtle hand gestures
- Posture and body language

=== 25 POSITIVE EMOTIONS (Grid Order: Left→Right, Top→Bottom) ===
1. Joy — genuine Duchenne smile, cheeks raised, eyes crinkling warmly
2. Contentment — relaxed gentle smile, soft calm eyes, peaceful posture
3. Amusement — laughing expression, eyes squinting with humor
4. Pride — chin slightly raised, confident smile, upright posture
5. Love — soft affectionate eyes, warm gentle smile, leaning forward

6. Gratitude — appreciative smile, hands touching chest, humble posture
7. Awe — wide eyes, mouth slightly open, head tilted upward
8. Inspiration — bright focused eyes, excited smile, hand raised explaining
9. Serenity — peaceful expression, eyes half-closed, completely relaxed
10. Hope — optimistic smile, eyes looking forward to distance

11. Relief — shoulders dropped, eyes briefly closed, relaxed smile forming
12. Trust — calm open expression, steady eye contact, relaxed posture
13. Admiration — attentive gaze upward, respectful slight smile
14. Compassion — empathetic soft eyes, gentle concerned expression
15. Elevation — emotionally moved, eyes shining, hand on heart

16. Enthusiasm — energetic wide smile, animated gestures, lively posture
17. Playfulness — mischievous grin, raised eyebrow, teasing gesture
18. Curiosity — raised eyebrows, head tilted forward, examining closely
19. Interest — focused attentive gaze, slightly parted lips
20. Anticipation — excited expectation, raised eyebrows, leaning forward

21. Satisfaction — small pleased smile, relaxed confident posture
22. Affection — warm fond smile, soft loving eyes, caring gesture
23. Triumph — arms suggesting victory, confident victorious smile
24. Calm_Confidence — composed expression, steady gaze, balanced posture
25. Delight — sparkling eyes, joyful smile, hands lifted in excitement

=== QUALITY REQUIREMENTS ===
- Transparent background (NO solid color background)
- NO text labels on the image
- Each grid cell: highest resolution possible
- Must show 100% full upper body in each cell
- Each emotion clearly distinct through facial muscles
- All 25 images SAME character identity
```

---

## Prompt 2 — 消极情绪25宫格

```
Use the provided reference image as the character identity to generate a 5×5 grid (25 images) of different NEGATIVE emotions for the SAME character.

=== CHARACTER CONSISTENCY REQUIREMENTS ===
Keep IDENTICAL across all grid cells:
- Face structure and features
- Hairstyle and hair color
- Clothing and accessories
- Body proportions
- Art style and rendering
- Lighting direction
- Background (transparent)
- Camera framing (chest-up, upper body visible)

=== VARY ONLY THESE ELEMENTS ===
- Facial expression (muscle configuration)
- Eyebrow position and shape
- Eye openness and gaze direction
- Mouth shape and position
- Head tilt angle
- Subtle hand gestures
- Posture and body language

=== 25 NEGATIVE EMOTIONS (Grid Order: Left→Right, Top→Bottom) ===
1. Sadness — downturned mouth, drooping eyelids, slumped posture
2. Grief — intense sorrow, brows raised in middle, moist eyes
3. Disappointment — slight frown, lowered gaze, subtle head shake
4. Regret — sad reflective expression, eyes looking down, tense lips
5. Shame — head lowered, eyes avoiding contact, tense mouth

6. Guilt — conflicted expression, brows drawn together, tight lips
7. Embarrassment — awkward smile, eyes looking away, head lowered
8. Anxiety — wide tense eyes, brows raised and pulled together
9. Fear — widened eyes, raised brows, slightly open mouth, tense
10. Panic — very wide eyes, mouth open, rigid trembling posture

11. Worry — brows knitted, lips pressed together, concerned gaze
12. Frustration — clenched jaw, brows lowered, tense posture
13. Irritation — narrowed eyes, slight sneer, head tilted back
14. Annoyance — subtle scowl, raised eyebrow, impatient expression
15. Anger — brows sharply lowered, glaring eyes, tight lips

16. Rage — intense glaring, teeth bared, aggressive expression
17. Disgust — wrinkled nose, upper lip raised, eyes narrowed
18. Contempt — one-sided smirk, raised lip corner, dismissive gaze
19. Jealousy — suspicious narrowed eyes, tight mouth, guarded
20. Envy — resentful expression, forced smile, watching another

21. Distrust — skeptical eyes, brows slightly lowered, guarded
22. Suspicion — narrowed evaluating eyes, head tilted, scrutinizing
23. Confusion — brows raised unevenly, unfocused eyes, mouth open
24. Stress — tense facial muscles, furrowed brows, tight lips
25. Exhaustion — drooping eyelids, slumped posture, fatigued

=== QUALITY REQUIREMENTS ===
- Transparent background (NO solid color background)
- NO text labels on the image
- Each grid cell: highest resolution possible
- Must show 100% full upper body in each cell
- Each emotion clearly distinct through facial muscles
- All 25 images SAME character identity
```

---

## Prompt 3 — 宫格裁剪指令

```
Split the provided 5×5 image grid into 25 separate individual images.

=== CROPPING RULES ===
1. Processing Order: Left to right, top to bottom (Cell 1→25)
2. Output: Exactly 25 individual PNG images

=== BOUNDARY REQUIREMENTS ===
- Crop strictly within each grid cell boundaries
- Do NOT include pixels from neighboring cells
- NO cross-cell artifacts or overlapping content
- Top margin: slightly above character's head, but NO content from row above

=== CHARACTER FRAMING ===
- Each image: complete upper body of character
- Maintain consistent character size across all outputs
- Character centered and proportionally aligned
- Preserve the exact pose and expression from the grid cell

=== RESOLUTION ===
- Output resolution: 2160 × 3840 (4K vertical)
- Preserve facial details during upscaling
- Maintain sharp edges and clean lines

=== CLEANUP REQUIREMENTS ===
- Remove ANY text labels or annotations
- Keep character and transparent background only
- Clean edges with no artifacts

=== FILE NAMING ===
Format: {emotion_name}.png

Positive emotions (Grid 1):
1.joy, 2.contentment, 3.amusement, 4.pride, 5.love,
6.gratitude, 7.awe, 8.inspiration, 9.serenity, 10.hope,
11.relief, 12.trust, 13.admiration, 14.compassion, 15.elevation,
16.enthusiasm, 17.playfulness, 18.curiosity, 19.interest, 20.anticipation,
21.satisfaction, 22.affection, 23.triumph, 24.calm_confidence, 25.delight

Negative emotions (Grid 2):
1.sadness, 2.grief, 3.disappointment, 4.regret, 5.shame,
6.guilt, 7.embarrassment, 8.anxiety, 9.fear, 10.panic,
11.worry, 12.frustration, 13.irritation, 14.annoyance, 15.anger,
16.rage, 17.disgust, 18.contempt, 19.jealousy, 20.envy,
21.distrust, 22.suspicion, 23.confusion, 24.stress, 25.exhaustion
```

---

## Prompt 4 — 4K超清提升

```
Enhance and upscale this emotion portrait image to 4K ultra-high definition quality.

=== CHARACTER REFERENCE ===
Use the following character description to restore and enhance details:
{PROMPT_0}

=== ENHANCEMENT REQUIREMENTS ===

1. Resolution Enhancement:
   - Upscale to 4K resolution (3840×2160 or equivalent)
   - Remove blur and noise artifacts
   - Sharpen edges while maintaining natural look

2. Detail Restoration:
   - Skin texture: Add realistic pores, subtle imperfections
   - Hair: Individual strand definition, natural highlights
   - Eyes: Iris detail, reflections, moisture
   - Lips: Natural texture and color depth
   - Clothing: Fabric texture and fold details

3. Preserve Exactly:
   - Original emotion/expression (DO NOT alter)
   - Character identity from reference (face structure, features)
   - Original pose and body position
   - Original lighting direction and mood
   - Transparent background

4. Quality Standards:
   - Photorealistic quality (if original is photorealistic)
   - Or maintain original art style (if stylized)
   - Natural color grading
   - No over-sharpening or artificial look
   - Clean alpha channel for transparency

=== OUTPUT ===
- Format: PNG with transparency
- Resolution: 4K (3840×2160 minimum)
- The enhanced image should look like a high-budget professional production
```

---

## Prompt 5 — 情绪视频生成

> **说明**: 每种情绪有对应的视频提示词，以4K图片作为首帧生成10秒循环视频。

### 通用视频参数
```
- Duration: 10 seconds seamless loop
- First frame = Last frame (perfect loop)
- Frame rate: 24fps minimum
- Resolution: 4K
- Background: Transparent or neutral
- Character scale: Fixed, consistent throughout
```

### 积极情绪视频提示词

**1. Joy**
```
Joy emotion animation, genuine Duchenne smile animation, cheeks gradually lifting, eyes crinkling warmly, bright joyful eyes sparkling, lively upright posture with small happy bounce of shoulders, natural breathing motion, joyful facial muscles relaxing and returning to starting position, seamless 10-second loop, first and last frame identical for perfect looping, character centered, consistent body scale, smooth expression transition, 4K ultra-high definition, transparent background.
```

**2. Contentment**
```
Contentment emotion animation, relaxed gentle smile slowly appearing, soft calm eyes blinking naturally, shoulders gently lowering in relaxation, slow breathing chest movement, peaceful posture with subtle head tilt, expression softly returning to neutral relaxed smile for loop closure, seamless 10-second loop animation, first and last frame identical, character size fixed, smooth motion, 4K ultra-HD, transparent background.
```

**3. Amusement**
```
Amusement laughing expression animation, mouth opening into light laughter, eyes squinting with humor, shoulders bouncing slightly as if chuckling, playful head tilt, brief laugh motion then returning to smiling start pose, seamless 10-second loop, first and last frame identical, smooth continuous motion, character centered, 4K ultra-HD, transparent background.
```

**4. Pride**
```
Pride expression animation, chin slowly lifting, confident upright posture, subtle confident smile forming, eyes steady and proud, chest slightly expanding, small nod of self-confidence, returning smoothly to initial pose for perfect loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**5. Love**
```
Love emotion animation, soft affectionate eyes, warm gentle smile slowly growing, body leaning slightly forward with caring warmth, subtle head tilt, small heartwarming expression change, returning smoothly to initial loving pose for loop, seamless 10-second loop, first and last frame identical, 4K ultra-HD, transparent background.
```

**6. Gratitude**
```
Gratitude expression animation, warm appreciative smile forming, hands gently touching chest in thankful gesture, eyes soft and sincere, slight bow of the head, gentle breathing motion, returning to initial thankful pose for seamless loop, 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.
```

**7. Awe**
```
Awe expression animation, eyes widening slowly, mouth slightly open in wonder, head tilting upward as if seeing something magnificent, subtle inhaling motion of surprise, expression gradually relaxing back to initial wonder pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.
```

**8. Inspiration**
```
Inspiration animation, bright focused eyes lighting up, subtle excited smile appearing, one hand raising as if explaining a brilliant idea, expressive gesture movement, thoughtful head tilt, returning smoothly to initial thoughtful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**9. Serenity**
```
Serenity calm animation, peaceful facial expression, eyes gently closed then slowly half-opening, relaxed breathing motion, shoulders loose and calm, head slightly tilted in tranquility, returning to original serene pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**10. Hope**
```
Hope expression animation, optimistic soft smile appearing gradually, eyes looking gently forward into the distance, subtle uplift of posture as if gaining confidence, calm breathing movement, expression returning to initial hopeful pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.
```

**11. Relief**
```
Relief emotion animation, shoulders slowly dropping after tension, eyes briefly closing in relaxation, soft relieved smile forming, gentle exhale motion, posture relaxing fully then returning to initial pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**12. Trust**
```
Trust expression animation, calm open face, steady eye contact forward, relaxed open posture, gentle reassuring nod, soft smile, returning to original trusting pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**13. Admiration**
```
Admiration animation, attentive gaze looking slightly upward toward someone admirable, respectful slight smile, subtle nod of appreciation, calm posture, expression returning to starting admiring pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.
```

**14. Compassion**
```
Compassion expression animation, empathetic eyes softening, gentle concerned expression, body leaning slightly forward as if offering support, subtle head tilt, calm breathing motion, returning smoothly to starting compassionate pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**15. Elevation**
```
Elevation emotion animation, emotionally moved expression, eyes shining with warmth, hand touching heart slowly, gentle smile forming, slight upward head tilt, returning to initial heartfelt pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**16. Enthusiasm**
```
Enthusiasm animation, energetic wide smile, lively expressive gestures with hands moving excitedly, animated posture with slight bounce, bright eyes sparkling, returning smoothly to initial excited pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**17. Playfulness**
```
Playfulness animation, mischievous grin forming, one eyebrow raising teasingly, playful head tilt, subtle cheeky gesture with hands, expression returning to initial playful pose for seamless loop, 10-second animation loop, identical first and last frame, 4K ultra-HD, transparent background.
```

**18. Curiosity**
```
Curiosity expression animation, eyebrows raising slowly, head tilting slightly forward, eyes focusing closely as if examining something interesting, subtle leaning motion, returning smoothly to starting curious pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**19. Interest**
```
Interest animation, focused attentive gaze forward, lips slightly parted, engaged posture leaning forward slightly, subtle nod of understanding, returning to initial attentive pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.
```

**20. Anticipation**
```
Anticipation emotion animation, raised eyebrows with excited expectation, slight forward lean, bright eyes waiting eagerly, subtle body tension building then relaxing back to start pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**21. Satisfaction**
```
Satisfaction animation, small pleased smile forming, relaxed confident posture, subtle nod of approval, calm breathing motion, expression returning smoothly to initial satisfied pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**22. Affection**
```
Affection emotion animation, warm fond smile, soft loving eyes, gentle caring body language with slight forward lean, small tender gesture with hands, returning to initial affectionate pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**23. Triumph**
```
Triumph animation, arms raising overhead in victory, confident victorious smile appearing, chest expanding proudly, celebratory gesture, returning smoothly to starting victorious pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**24. Calm_Confidence**
```
Calm confidence animation, composed facial expression, steady confident gaze forward, upright balanced posture, subtle nod of assurance, gentle breathing motion, returning to initial confident pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**25. Delight**
```
Delight animation, bright sparkling eyes, joyful smile widening, hands lifting slightly in happy excitement, playful bounce of posture, returning smoothly to starting delighted pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

---

### 消极情绪视频提示词

**1. Sadness**
```
Sadness emotion animation, downturned mouth slowly forming, drooping eyelids, gaze gradually lowering toward the ground, slumped shoulders and tired posture, subtle sigh and slow breathing motion, expression gently returning to the initial sad neutral pose, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.
```

**2. Grief**
```
Grief emotion animation, intense sorrow expression, eyebrows raised in the middle, mouth trembling slightly, moist eyes blinking slowly as if holding tears, shoulders subtly shaking with deep emotional pain, expression slowly settling back to the initial grieving pose for loop closure, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.
```

**3. Disappointment**
```
Disappointment expression animation, slight frown appearing, gaze lowering slowly, small disappointed head shake, shoulders dropping subtly, lips pressing briefly before relaxing back to initial disappointed pose, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.
```

**4. Regret**
```
Regret emotion animation, sad reflective expression, eyes looking downward thoughtfully, lips tightening slightly with tension, subtle slow head tilt as if reflecting on a mistake, gentle sigh motion, expression returning to the original regretful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**5. Shame**
```
Shame expression animation, head slowly lowering, eyes avoiding eye contact and glancing downward, tense mouth with lips pressed together, shoulders curling inward slightly, shy embarrassed breathing motion, returning smoothly to initial shame pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**6. Guilt**
```
Guilt emotion animation, conflicted facial expression, brows drawn together tightly, lips pressed and trembling slightly, eyes glancing downward and sideways uneasily, subtle tense posture, expression gradually returning to the initial guilty pose for seamless loop, 10-second animation loop, identical first and last frame, 4K ultra-HD, transparent background.
```

**7. Embarrassment**
```
Embarrassment animation, awkward small smile appearing nervously, eyes looking away to the side, head slightly lowered with shy posture, brief nervous shoulder movement, expression returning gently to starting embarrassed pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**8. Anxiety**
```
Anxiety expression animation, wide tense eyes shifting slightly, brows raised and pulled together, tight mouth and shallow breathing, subtle restless head movement, shoulders slightly tense, expression returning to the starting anxious pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**9. Fear**
```
Fear emotion animation, widened eyes scanning quickly, raised brows, slightly open mouth, tense posture with subtle backward lean, quick breathing motion, expression returning smoothly to initial fearful pose for perfect loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**10. Panic**
```
Panic animation, extremely wide eyes, mouth open in alarm, rigid body posture with trembling motion, shoulders tense and lifted, fast breathing motion, expression gradually settling back to initial panic pose for loop closure, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**11. Worry**
```
Worry expression animation, brows knitted tightly, lips pressed together, concerned gaze shifting downward, subtle head tilt while thinking anxiously, shoulders tense then relaxing slightly back to original worried pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**12. Frustration**
```
Frustration emotion animation, clenched jaw appearing gradually, brows lowered, tense posture with shoulders tightening, small irritated head movement, lips pressing then relaxing back to starting frustrated pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**13. Irritation**
```
Irritation animation, narrowed eyes with slight sneer, head tilting back slightly in annoyance, subtle impatient facial twitch, lips curling briefly then returning to starting irritated expression, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**14. Annoyance**
```
Annoyance expression animation, subtle scowl appearing, one eyebrow raising impatiently, eyes glancing sideways, slight head tilt with irritated posture, expression returning to initial annoyed pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**15. Anger**
```
Anger animation, brows sharply lowered, glaring eyes focused forward, tight lips pressing firmly, tense posture with slight forward lean, controlled breathing motion, expression returning to initial angry pose for seamless loop, 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**16. Rage**
```
Rage emotion animation, intense glaring eyes, teeth bared aggressively, brows deeply furrowed, strong tense body posture with slight shaking motion, heavy breathing, expression returning smoothly to initial rage pose for loop closure, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**17. Disgust**
```
Disgust expression animation, wrinkled nose appearing gradually, upper lip raised, narrowed eyes reacting to something unpleasant, slight head recoil backward, expression returning smoothly to initial disgust pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**18. Contempt**
```
Contempt animation, one-sided smirk forming slowly, raised lip corner, dismissive sideways gaze, subtle head tilt of superiority, expression returning to initial contempt pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**19. Jealousy**
```
Jealousy emotion animation, suspicious narrowed eyes glancing sideways, tight mouth with tension, guarded posture, subtle uneasy breathing motion, expression returning to starting jealous pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**20. Envy**
```
Envy animation, resentful expression forming slowly, forced polite smile, eyes watching someone else with lingering gaze, subtle tension in posture, expression returning smoothly to initial envy pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**21. Distrust**
```
Distrust expression animation, skeptical eyes narrowing slightly, brows lowered cautiously, guarded facial expression, subtle backward head tilt, expression returning smoothly to initial distrust pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**22. Suspicion**
```
Suspicion animation, narrowed evaluating eyes, head tilting slightly to one side, thoughtful suspicious gaze examining something, lips pressing slightly, expression returning to initial suspicious pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**23. Confusion**
```
Confusion expression animation, brows raised unevenly, eyes unfocused briefly then blinking, mouth slightly open in puzzlement, subtle head tilt while thinking, expression returning to starting confused pose for loop closure, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**24. Stress**
```
Stress emotion animation, tense facial muscles tightening, brows deeply furrowed, lips pressed together firmly, shoulders stiff with pressure, quick tense breathing motion, expression returning smoothly to initial stressed pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.
```

**25. Exhaustion**
```
Exhaustion animation, drooping eyelids slowly closing halfway, slumped tired posture, slow heavy breathing motion, head slightly lowering as if fatigued, expression returning gently to initial exhausted pose for seamless loop, 10-second animation loop, identical first and last frame, 4K ultra-HD, transparent background.
```

---

## 使用说明

1. **Prompt 1/2**: 用于步骤1，配合参考图生成宫格
2. **Prompt 3**: 用于步骤2，裁剪宫格为独立图片
3. **Prompt 4**: 用于步骤3，需替换 `{PROMPT_0}` 为用户的原始提示词
4. **Prompt 5**: 用于步骤4，根据情绪名称选择对应提示词

---

## 情绪名称映射表

| 序号 | 积极情绪 | 消极情绪 |
|-----|---------|---------|
| 1 | joy | sadness |
| 2 | contentment | grief |
| 3 | amusement | disappointment |
| 4 | pride | regret |
| 5 | love | shame |
| 6 | gratitude | guilt |
| 7 | awe | embarrassment |
| 8 | inspiration | anxiety |
| 9 | serenity | fear |
| 10 | hope | panic |
| 11 | relief | worry |
| 12 | trust | frustration |
| 13 | admiration | irritation |
| 14 | compassion | annoyance |
| 15 | elevation | anger |
| 16 | enthusiasm | rage |
| 17 | playfulness | disgust |
| 18 | curiosity | contempt |
| 19 | interest | jealousy |
| 20 | anticipation | envy |
| 21 | satisfaction | distrust |
| 22 | affection | suspicion |
| 23 | triumph | confusion |
| 24 | calm_confidence | stress |
| 25 | delight | exhaustion |
