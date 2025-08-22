const CATEGORIES = ['Protein', 'Veggies', 'Fruits', 'Grains', 'Dairy'];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('generate-btn').addEventListener('click', generateMealPlan);
});

async function generateMealPlan() {
    const date = document.getElementById('date').value;
    const userGoals = {
        calories: +document.getElementById('calories').value,
        protein: +document.getElementById('protein').value
    };
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').innerHTML = '';

    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const generated = { breakfast: [], lunch: [], dinner: [] };
    const fulfilled = new Set();

    for (let mealType of mealTypes) {
        try {
            const proxy = 'https://corsproxy.io/?';
            const url = `${proxy}https://tufts.api.nutrislice.com/menu/api/weeks/school/dewick-dining/menu-type/${mealType}/${date.replace(/-/g, '/')}/`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
            });
            const data = await res.json();
            const items = processMenu(data, date);
            const valid = items.filter(i => i.nutrition.calories > 0);
            generated[mealType] = selectForMeal(valid, userGoals, fulfilled);
        } catch (e) {
            console.warn(`Error fetching ${mealType}:`, e);
        }
    }

    document.getElementById('loading').style.display = 'none';
    displayResults(generated, userGoals, fulfilled, date);
}

function processMenu(data, date) {
    if (!data.days) return [];
    const day = data.days.find(d => d.date === date);
    if (!day?.menu_items) return [];

    const items = day.menu_items.map(i => {
        const food = i.food || {};
        const n = food.rounded_nutrition_info || {};
        const name = food.name || 'Unnamed';
        return {
            name,
            description: food.description || '',
            category: categorize(name),
            nutrition: {
                calories: parseInt(n.calories) || 0,
                protein: parseInt(n.g_protein) || 0,
                carbs: parseInt(n.g_carbs) || 0,
                fat: parseInt(n.g_fat) || 0
            }
        };
    });

    const seen = new Set();
    return items.filter(item => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
    });
}

function categorize(name) {
    const s = name.toLowerCase();
    if (/egg|sausage|bacon|chicken|ham|tofu|pork|beef|fish|turkey|meatball|burger|crumbles|piccata|meatloaf|shrimp|pollock|thigh|breast|pepperoni|chorizo|steak|willy|moroccan|seitan/.test(s)) return 'Protein';
    if (/potato|tomato|broccoli|spinach|pepper|onion|veggie|vegetable|salad|greens|carrot|kale|chard|pea|bean|zucchini|squash|cucumber|cauliflower|mint|lettuce|snow pea/.test(s)) return 'Veggies';
    if (/apple|banana|berry|orange|grape|fruit|pineapple|pear|raisin|melon|grapefruit|blueberry|coconut|apricot|cherry/.test(s)) return 'Fruits';
    if (/pancake|waffle|bread|oat|cereal|muffin|bagel|grain|rice|quinoa|toast|croissant|pasta|linguini|shell|noodle|risotto|orzo|barley/.test(s)) return 'Grains';
    if (/milk|cheese|yogurt/.test(s)) return 'Dairy';
    return 'Misc';
}

function selectForMeal(items, goals, fulfilled) {
    const target = Math.round(goals.calories / 3);
    const sorted = items.sort((a, b) => {
        const needA = !fulfilled.has(a.category) && a.category !== 'Misc';
        const needB = !fulfilled.has(b.category) && b.category !== 'Misc';
        
        const proteinRatioA = a.nutrition.calories > 0 ? a.nutrition.protein / a.nutrition.calories : 0;
        const proteinRatioB = b.nutrition.calories > 0 ? b.nutrition.protein / b.nutrition.calories : 0;

        return (needA === needB ? 0 : needA ? -1 : 1) || (proteinRatioB - proteinRatioA);
    });

    const chosen = [];
    let sumCals = 0;
    const itemCounts = {};

    for (let item of sorted) {
        if (sumCals >= target * 0.9) break;

        const maxQuantity = 3;
        const currentCount = itemCounts[item.name] || 0;

        if (currentCount >= maxQuantity) continue;

        const remainingQuantity = maxQuantity - currentCount;
        const possibleAdditions = Math.min(
            remainingQuantity,
            item.nutrition.calories > 0 ? Math.floor((target * 1.2 - sumCals) / item.nutrition.calories) : 0
        );

        if (possibleAdditions > 0) {
            const additionsToMake = Math.min(possibleAdditions, maxQuantity - currentCount);
            for (let i = 0; i < additionsToMake; i++) {
                chosen.push(item);
                sumCals += item.nutrition.calories;
                itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
                if (item.category !== 'Misc') fulfilled.add(item.category);
            }
        }
    }

    return chosen;
}

function displayResults(meals, goals, fulfilled, date) {
    let html = `<h2>Meal Plan for ${date}</h2>
<p class="totals">Daily Goals: ${goals.calories} cal, ${goals.protein}g protein</p>`;

    let totals = { calories: 0, protein: 0 };

    for (let [meal, items] of Object.entries(meals)) {
        if (!items.length) continue;

        html += `<div class="meal"><h3>${meal.charAt(0).toUpperCase() + meal.slice(1)}:</h3>`;

        const counts = {};
        items.forEach(it => counts[it.name] = (counts[it.name] || 0) + 1);

        Object.keys(counts).forEach(name => {
            const item = items.find(i => i.name === name);
            const qty = counts[name];
            html += `<div class="food-item">• ${name} [${item.category}]${qty > 1 ? ` (x${qty})` : ''}<br>
        &nbsp;&nbsp;${item.nutrition.calories * qty} cal | ${item.nutrition.protein * qty}g protein</div>`;
            totals.calories += item.nutrition.calories * qty;
            totals.protein += item.nutrition.protein * qty;
        });

        html += '</div>';
    }

    html += `<div class="totals"><hr>Nutrition Totals:<br>
    Calories: ${totals.calories}/${goals.calories} (${(totals.calories / goals.calories * 100).toFixed(1)}%)<br>
    Protein: ${totals.protein}/${goals.protein} (${(totals.protein / goals.protein * 100).toFixed(1)}%)</div>`;

    html += '<div class="checklist"><p>Food Group Checklist:</p>';
    CATEGORIES.forEach(c => {
        html += `<div class="check-item">${fulfilled.has(c) ? '✅' : '❌'} ${c}</div>`;
    });
    html += '</div>';

    document.getElementById('results').innerHTML = html;
}