/**
 * Groq LLM Service for AI Recipe Generation
 * Generates zero-waste recipes prioritizing items expiring soon
 */

export const generateRecipesWithLLM = async ({
  expiringItems = [],
  allPantryItems = [],
  dietaryPreferences = [],
  customDietFilter = null,
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  const configuredModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    console.warn('[LLM Service] GROQ_API_KEY is not set. Returning curated zero-waste fallback recipes.');
    return getCuratedFallbackRecipes(expiringItems, allPantryItems, customDietFilter);
  }

  // Format pantry items summary with category and days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysLeft = (item) => {
    if (typeof item.daysRemaining === 'number') return item.daysRemaining;
    if (item.expiryDate) {
      const target = new Date(item.expiryDate);
      target.setHours(0, 0, 0, 0);
      return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const expiringStr = expiringItems
    .map((i) => {
      const days = getDaysLeft(i);
      const expLabel = days <= 0 ? 'expires today' : `${days}d left`;
      const catLabel = i.category ? ` [Category: ${i.category}]` : '';
      return `${i.name}${catLabel} (${i.quantity || '1 portion'}, ${expLabel})`;
    })
    .join(', ');

  const otherItemsStr = allPantryItems
    .filter((i) => !expiringItems.some((e) => e._id && i._id && e._id.toString() === i._id.toString()))
    .map((i) => `${i.name} (${i.quantity || 'available'})`)
    .join(', ');

  let dietList = [...(dietaryPreferences || [])];
  if (customDietFilter) {
    if (customDietFilter === 'All') {
      dietList = [];
    } else if (customDietFilter === 'Non-Vegetarian') {
      dietList = dietList.filter((d) => d !== 'Vegetarian' && d !== 'Vegan');
      if (!dietList.includes('Non-Vegetarian')) dietList.push('Non-Vegetarian');
    } else if (customDietFilter === 'Vegetarian' || customDietFilter === 'Vegan') {
      dietList = dietList.filter((d) => d !== 'Non-Vegetarian');
      if (!dietList.includes(customDietFilter)) dietList.push(customDietFilter);
    } else {
      if (!dietList.includes(customDietFilter)) dietList.push(customDietFilter);
    }
  }
  const dietStr = dietList.length > 0 ? dietList.join(', ') : 'No restriction (Omnivore / Any)';

  const systemPrompt = `You are a world-class zero-waste chef and recipe developer.
Your mission is to help a home cook create delicious, healthy meals that strictly prioritize using ingredients that are expiring soon.

Rules:
1. CRITICAL: Prioritize soon-to-expire items listed in "EXPIRING SOON INGREDIENTS", especially highly perishable proteins like fresh chicken, fish, seafood, and meat before they spoil.
2. If non-vegetarian items (e.g. chicken, fish, salmon, prawns, meat, seafood) are listed in "EXPIRING SOON INGREDIENTS" and no Vegetarian/Vegan restriction is active, you MUST generate delicious non-vegetarian recipes highlighting these proteins!
3. Keep missing ingredients to an absolute minimum (max 2-3 common household staples like salt, cooking oil, garlic, black pepper).
4. Respect active dietary preferences strictly: (${dietStr}).
5. Output MUST be ONLY a valid JSON array of 3 recipe objects, with NO markdown ticks, NO explanations, NO intro text.

JSON Schema for each recipe:
{
  "title": "string (appetizing recipe name)",
  "time": "string (e.g. 15 mins, 25 mins)",
  "servings": "string (e.g. 2 servings)",
  "description": "string (1-2 sentences explaining why this dish saves the expiring food)",
  "usesIngredients": ["string (ingredients from user's pantry)"],
  "missingIngredients": ["string (minimal missing pantry items needed)"],
  "steps": ["string (step 1)", "string (step 2)", "string (step 3)", "string (step 4)"]
}`;

  const userPrompt = `USER'S PANTRY:
- EXPIRING SOON INGREDIENTS (USE FIRST): ${expiringStr || 'None specified'}
- OTHER AVAILABLE PANTRY INGREDIENTS: ${otherItemsStr || 'None specified'}
- DIETARY PREFERENCES / FILTER: ${dietStr}

Generate 3 creative, delicious recipes that use up the expiring food. Output pure JSON array only.`;

  // Attempt configured model first, then fallback to versatile models
  const modelsToTry = [
    configuredModel,
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`[LLM Service] Calling Groq API with model: ${model}`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn(`[LLM Service] Model ${model} failed with:`, errorData);
        continue; // Try next model
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) continue;

      // Clean & parse JSON safely
      const parsed = parseLLMJson(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      } else if (parsed && Array.isArray(parsed.recipes)) {
        return parsed.recipes;
      }
    } catch (err) {
      console.error(`[LLM Service Exception with ${model}]:`, err.message);
    }
  }

  console.warn('[LLM Service] All Groq models failed or returned invalid format. Using curated recipes.');
  return getCuratedFallbackRecipes(expiringItems, allPantryItems, customDietFilter);
};

const parseLLMJson = (text) => {
  try {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.substring(7);
    if (clean.startsWith('```')) clean = clean.substring(3);
    if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
    return JSON.parse(clean.trim());
  } catch (err) {
    console.error('[LLM JSON Parse Error]', err.message);
    return null;
  }
};

const getCuratedFallbackRecipes = (expiring = [], all = [], dietFilter = null) => {
  const isNonVegItem = (name) => /(chicken|brest|breast|fish|salmon|prawn|shrimp|beef|pork|mutton|lamb|tuna|turkey|meat|bacon|seafood|egg)/i.test(name);
  const isDairyItem = (name) => /(milk|yogurt|curd|cheese|paneer|butter|ghee|cream|dairy)/i.test(name);
  const isGlutenItem = (name) => /(bread|flour|wheat|pasta|noodle|dough|roti|naan|bagel|toast)/i.test(name);

  // Filter raw ingredients according to the active diet filter
  let validExpiring = [...expiring];
  let validAll = [...all];

  if (dietFilter === 'Vegan') {
    validExpiring = validExpiring.filter((i) => !isNonVegItem(i.name) && !isDairyItem(i.name));
    validAll = validAll.filter((i) => !isNonVegItem(i.name) && !isDairyItem(i.name));
  } else if (dietFilter === 'Vegetarian') {
    validExpiring = validExpiring.filter((i) => !isNonVegItem(i.name));
    validAll = validAll.filter((i) => !isNonVegItem(i.name));
  } else if (dietFilter === 'Dairy-Free') {
    validExpiring = validExpiring.filter((i) => !isDairyItem(i.name));
    validAll = validAll.filter((i) => !isDairyItem(i.name));
  } else if (dietFilter === 'Gluten-Free') {
    validExpiring = validExpiring.filter((i) => !isGlutenItem(i.name));
    validAll = validAll.filter((i) => !isGlutenItem(i.name));
  }

  // If user has zero items matching the diet filter
  if (validAll.length === 0 && validExpiring.length === 0) {
    return [];
  }

  const expNames = validExpiring.map((e) => e.name);
  const otherNames = validAll
    .filter((i) => !validExpiring.some((e) => e._id && i._id && e._id.toString() === i._id.toString()))
    .map((i) => i.name);
  
  // Real ingredients only
  const realPantryNames = [...new Set([...expNames, ...otherNames])];

  const primaryItem = expNames[0] || realPantryNames[0];
  const secondaryItem = realPantryNames.find((n) => n.toLowerCase() !== primaryItem.toLowerCase()) || null;

  const hasNonVeg = (dietFilter !== 'Vegan' && dietFilter !== 'Vegetarian') && realPantryNames.some(isNonVegItem);
  const mainProtein = hasNonVeg ? (realPantryNames.find(isNonVegItem) || primaryItem) : primaryItem;
  const sideItem = realPantryNames.find((n) => n.toLowerCase() !== mainProtein.toLowerCase()) || null;

  // Single-item vs Two-item title and desc builders
  const makeTitle = (baseTitle, singleTitle) => {
    return sideItem ? baseTitle(mainProtein, sideItem) : singleTitle(mainProtein);
  };

  const makeDesc = (baseDesc, singleDesc) => {
    return sideItem ? baseDesc(mainProtein, sideItem) : singleDesc(mainProtein);
  };

  const makeSteps = (twoSteps, singleSteps) => {
    return sideItem ? twoSteps(mainProtein, sideItem) : singleSteps(mainProtein);
  };

  // Recipe templates (100% strictly using real items only in usesIngredients)
  const nonVegThemes = [
    {
      title: (p, s) => s ? `Lemon-Garlic Pan-Seared ${p} with ${s}` : `Lemon-Garlic Pan-Seared ${p}`,
      time: '20 mins',
      servings: '2 servings',
      desc: (p, s) => s ? `Crisps up near-expiry ${p} in a zesty lemon-herb reduction paired with ${s}.` : `Quick high-heat sear to rescue ${p} with garlic, olive oil, and fresh lemon.`,
      missing: ['Olive oil or cooking oil', 'Garlic cloves', 'Lemon juice & pepper'],
      steps: (p, s) => s ? [
        `Season ${p} generously with salt, cracked pepper, and minced garlic.`,
        `Heat 1 tbsp oil in a skillet over medium-high heat until hot.`,
        `Sear ${p} for 5-6 minutes on each side until golden-brown and cooked through.`,
        `Toss in ${s}, deglaze with fresh lemon juice for 2 minutes, and serve together.`
      ] : [
        `Pat ${p} completely dry and season generously with salt and black pepper.`,
        `Heat 1 tbsp oil in a heavy skillet over medium-high heat.`,
        `Sear ${p} for 5-6 minutes per side until golden and cooked through.`,
        `Finish with crushed garlic and fresh lemon juice over the pan juices.`
      ]
    },
    {
      title: (p, s) => s ? `Crispy Garlic ${p} & ${s} Stir-Fry` : `Crispy Garlic & Pepper ${p} Stir-Fry`,
      time: '15 mins',
      servings: '2 servings',
      desc: (p, s) => s ? `High-heat flash cooking to lock in juices for ${p} and ${s}.` : `Fast wok stir-fry that caramelizes ${p} with garlic and pantry spices.`,
      missing: ['Cooking oil', 'Soy sauce or salt', 'Garlic & chili flakes'],
      steps: (p, s) => s ? [
        `Slice ${p} and ${s} into thin, bite-sized strips.`,
        `Heat oil in a wok or large skillet over high heat.`,
        `Flash-fry ${p} for 4 minutes until edges brown, then add ${s}.`,
        `Drizzle soy sauce or seasoning and toss for 2 minutes.`
      ] : [
        `Slice ${p} into bite-sized strips.`,
        `Heat oil in a pan over high heat, add minced garlic and spices for 30 seconds.`,
        `Add ${p} and stir-fry vigorously for 5 minutes until caramelized.`,
        `Season to taste and serve immediately.`
      ]
    },
    {
      title: (p, s) => s ? `Smoky Herb-Roasted ${p} & ${s} Skillet` : `Smoky Herb-Roasted ${p} Skillet`,
      time: '22 mins',
      servings: '2-3 servings',
      desc: (p, s) => s ? `Hearty skillet bake melding ${p} and ${s} with warm aromatic spices.` : `One-pan oven or skillet roast bringing out deep flavor from ${p}.`,
      missing: ['Cooking oil', 'Paprika or chili powder', 'Salt & black pepper'],
      steps: (p, s) => s ? [
        `Cube ${p} and chop ${s} into uniform pieces.`,
        `Toss with cooking oil, salt, and paprika in a skillet.`,
        `Cook on medium-low heat with lid for 12-15 minutes until tender.`,
        `Garnish with herbs and serve warm.`
      ] : [
        `Cut ${p} into uniform pieces and toss with 1 tbsp oil, paprika, and salt.`,
        `Sear in a hot pan or oven-safe skillet for 5 minutes.`,
        `Cover and cook on medium-low for 10 minutes until tender and juicy.`,
        `Rest for 2 minutes before serving.`
      ]
    },
    {
      title: (p, s) => s ? `Garlic Butter Glazed ${p} with ${s}` : `Garlic Butter Glazed ${p}`,
      time: '18 mins',
      servings: '2 servings',
      desc: (p, s) => s ? `Velvety garlic butter glaze that elevates ${p} and ${s}.` : `Classic rich pan-sear coating ${p} in golden garlic butter.`,
      missing: ['Butter or olive oil', 'Minced garlic', 'Salt & cracked pepper'],
      steps: (p, s) => s ? [
        `Pat ${p} dry and season with salt and pepper.`,
        `Melt butter/oil in a pan, sear ${p} for 4-5 mins per side.`,
        `Add minced garlic and ${s}, spooning pan juices over ${p}.`,
        `Cook for 3 minutes and plate warm.`
      ] : [
        `Score ${p} lightly and season with salt and pepper.`,
        `Melt butter/oil in a skillet over medium heat.`,
        `Cook ${p} for 5 minutes per side while spooning garlic butter over the top.`,
        `Rest for 2 minutes and serve hot.`
      ]
    }
  ];

  const plantThemes = [
    {
      title: (p, s) => s ? `Zesty Lemon-Herb Sautéed ${p} & ${s}` : `Zesty Lemon-Herb Sautéed ${p}`,
      time: '15 mins',
      servings: '2 servings',
      desc: (p, s) => s ? `Quick vitamin-packed plant sauté reviving near-expiry ${p} and ${s}.` : `Simple vibrant skillet sauté highlighting fresh ${p} with lemon and garlic.`,
      missing: ['Olive oil', 'Minced garlic', 'Lemon juice & sea salt'],
      steps: (p, s) => s ? [
        `Wash and slice ${p} and ${s} into bite-sized pieces.`,
        `Heat 1 tbsp olive oil with garlic in a skillet.`,
        `Sauté ${p} for 3 minutes, add ${s}, and toss until tender-crisp.`,
        `Season with sea salt, pepper, and fresh lemon juice.`
      ] : [
        `Wash and prepare ${p} into bite-sized pieces.`,
        `Heat 1 tbsp olive oil with minced garlic in a skillet.`,
        `Sauté ${p} for 4-5 minutes until tender and fragrant.`,
        `Finish with sea salt, pepper, and a generous squeeze of fresh lemon juice.`
      ]
    },
    {
      title: (p, s) => s ? `Crispy Skillet Hash with ${p} & ${s}` : `Crispy Golden Skillet Hash with ${p}`,
      time: '18 mins',
      servings: '2 servings',
      desc: (p, s) => s ? `Golden pan hash transforming ${p} and ${s} into a comforting meal.` : `Crispy, golden skillet hash turning ${p} into a delicious zero-waste meal.`,
      missing: ['Olive oil or cooking oil', 'Salt & black pepper', 'Paprika'],
      steps: (p, s) => s ? [
        `Dice ${p} and ${s} into small cubes.`,
        `Heat 1 tbsp oil in a heavy skillet over medium-high heat.`,
        `Press down firmly and let crisp undisturbed for 4 minutes.`,
        `Flip, season with salt and paprika, and cook 3 more minutes.`
      ] : [
        `Dice ${p} into small uniform pieces.`,
        `Heat 1 tbsp oil in a skillet over medium heat.`,
        `Spread ${p} evenly and cook for 5-6 minutes until edges are crisp and golden.`,
        `Season with salt, pepper, and paprika.`
      ]
    },
    {
      title: (p, s) => s ? `Garlic & Soy Wok Stir-Fry with ${p} & ${s}` : `Garlic & Soy Wok Stir-Fry with ${p}`,
      time: '15 mins',
      servings: '2 servings',
      desc: (p, s) => s ? `Fast high-heat wok toss keeping ${p} and ${s} crisp and flavorful.` : `Flash stir-fry locking in fresh nutrients and flavor of ${p}.`,
      missing: ['Cooking oil', 'Soy sauce or salt', 'Garlic or ginger'],
      steps: (p, s) => s ? [
        `Slice ${p} and ${s} into thin strips.`,
        `Heat oil in a wok until hot, add minced garlic for 30 seconds.`,
        `Toss in ${p} and ${s}, stir-frying on high for 3-4 minutes.`,
        `Splash with soy sauce and serve hot.`
      ] : [
        `Slice ${p} into thin strips.`,
        `Heat oil in a wok or pan, add garlic and cook for 30 seconds.`,
        `Add ${p} and stir-fry on high heat for 3-4 minutes.`,
        `Drizzle soy sauce or seasoning and serve immediately.`
      ]
    },
    {
      title: (p, s) => s ? `Aromatic Herb-Roasted ${p} & ${s}` : `Aromatic Herb-Roasted ${p}`,
      time: '20 mins',
      servings: '2-3 servings',
      desc: (p, s) => s ? `Oven or pan-roasted perfection concentrating flavors of ${p} and ${s}.` : `Caramelized roasted ${p} seasoned with dry herbs and sea salt.`,
      missing: ['Olive oil', 'Dried herbs (oregano or rosemary)', 'Salt & pepper'],
      steps: (p, s) => s ? [
        `Chop ${p} and ${s} into uniform rustic pieces.`,
        `Toss with olive oil, herbs, and coarse salt.`,
        `Roast in oven at 400°F (200°C) or pan-sear covered for 15 minutes.`,
        `Serve warm.`
      ] : [
        `Chop ${p} and toss with 1 tbsp olive oil, herbs, and coarse salt.`,
        `Cook in a pan or oven at 400°F for 15 minutes until tender and caramelized.`,
        `Serve warm as a nourishing side or main.`
      ]
    }
  ];

  let pool = plantThemes;
  if (hasNonVeg && (dietFilter === 'Non-Vegetarian' || dietFilter === 'All' || !dietFilter || dietFilter === 'High-Protein')) {
    pool = nonVegThemes;
  }

  if (dietFilter === 'Quick (< 20m)') {
    pool = pool.filter((t) => parseInt(t.time, 10) <= 20);
  }

  // Shuffle pool to guarantee fresh, distinct variations
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = (shuffled.length >= 3 ? shuffled : pool).slice(0, 3);

  // usesIngredients contains ONLY the real ingredients present in the user's pantry
  const actualUses = [mainProtein, sideItem].filter(Boolean);

  return selected.map((t) => {
    return {
      title: t.title(mainProtein, sideItem),
      time: t.time,
      servings: t.servings,
      description: t.desc(mainProtein, sideItem),
      usesIngredients: actualUses,
      missingIngredients: t.missing,
      steps: t.steps(mainProtein, sideItem),
    };
  });
};

export default {
  generateRecipesWithLLM,
};
