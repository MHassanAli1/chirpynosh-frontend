'use client';

import { useState } from 'react';

interface Ingredient {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  name: string;
  image: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  matchedIngredients: string[];
  missingIngredients: string[];
  instructions: string[];
}

// Dummy recipe database
const RECIPE_DATABASE: Recipe[] = [
  {
    id: '1',
    name: 'Fresh Garden Salad',
    image: 'salad',
    time: '10 mins',
    difficulty: 'Easy',
    matchedIngredients: ['lettuce', 'tomato', 'cucumber', 'onion'],
    missingIngredients: ['olive oil', 'vinegar'],
    instructions: [
      'Wash and chop all vegetables',
      'Combine in a large bowl',
      'Drizzle with olive oil and vinegar',
      'Season with salt and pepper to taste'
    ]
  },
  {
    id: '2',
    name: 'Veggie Stir Fry',
    image: 'stirfry',
    time: '20 mins',
    difficulty: 'Easy',
    matchedIngredients: ['carrot', 'broccoli', 'bell pepper', 'garlic'],
    missingIngredients: ['soy sauce', 'sesame oil'],
    instructions: [
      'Chop vegetables into bite-sized pieces',
      'Heat oil in a wok or large pan',
      'Stir fry garlic until fragrant',
      'Add vegetables and cook for 5-7 minutes',
      'Season with soy sauce and serve'
    ]
  },
  {
    id: '3',
    name: 'Tomato Pasta',
    image: 'pasta',
    time: '25 mins',
    difficulty: 'Easy',
    matchedIngredients: ['tomato', 'garlic', 'onion', 'pasta'],
    missingIngredients: ['basil', 'parmesan'],
    instructions: [
      'Cook pasta according to package instructions',
      'Sauté garlic and onion until soft',
      'Add diced tomatoes and simmer for 10 mins',
      'Combine with pasta and top with basil and cheese'
    ]
  },
  {
    id: '4',
    name: 'Banana Smoothie',
    image: 'smoothie',
    time: '5 mins',
    difficulty: 'Easy',
    matchedIngredients: ['banana', 'milk', 'honey'],
    missingIngredients: ['ice'],
    instructions: [
      'Add banana, milk, and honey to blender',
      'Add ice cubes',
      'Blend until smooth',
      'Pour and enjoy!'
    ]
  },
  {
    id: '5',
    name: 'Egg Fried Rice',
    image: 'rice',
    time: '15 mins',
    difficulty: 'Medium',
    matchedIngredients: ['rice', 'egg', 'carrot', 'peas', 'onion'],
    missingIngredients: ['soy sauce', 'sesame oil'],
    instructions: [
      'Cook rice and let it cool (or use day-old rice)',
      'Scramble eggs in a pan and set aside',
      'Stir fry vegetables until tender',
      'Add rice and eggs, mix well',
      'Season with soy sauce and serve'
    ]
  },
  {
    id: '6',
    name: 'Cheese Sandwich',
    image: 'sandwich',
    time: '5 mins',
    difficulty: 'Easy',
    matchedIngredients: ['bread', 'cheese', 'butter'],
    missingIngredients: [],
    instructions: [
      'Butter two slices of bread',
      'Add cheese between slices',
      'Grill or toast until cheese melts',
      'Cut in half and serve'
    ]
  },
  {
    id: '7',
    name: 'Vegetable Soup',
    image: 'soup',
    time: '30 mins',
    difficulty: 'Medium',
    matchedIngredients: ['carrot', 'potato', 'onion', 'celery'],
    missingIngredients: ['vegetable broth', 'herbs'],
    instructions: [
      'Chop all vegetables',
      'Sauté onion until translucent',
      'Add other vegetables and broth',
      'Simmer for 20-25 minutes',
      'Season and serve hot'
    ]
  },
  {
    id: '8',
    name: 'Fruit Yogurt Bowl',
    image: 'bowl',
    time: '5 mins',
    difficulty: 'Easy',
    matchedIngredients: ['yogurt', 'banana', 'apple', 'honey'],
    missingIngredients: ['granola'],
    instructions: [
      'Add yogurt to a bowl',
      'Slice fruits on top',
      'Drizzle with honey',
      'Add granola for crunch'
    ]
  },
];

// Common ingredients for suggestions
const COMMON_INGREDIENTS = [
  'tomato', 'onion', 'garlic', 'carrot', 'potato', 'lettuce', 'cucumber',
  'bell pepper', 'broccoli', 'egg', 'cheese', 'bread', 'rice', 'pasta',
  'chicken', 'beef', 'fish', 'banana', 'apple', 'milk', 'yogurt', 'butter',
  'honey', 'lemon', 'ginger', 'celery', 'mushroom', 'spinach', 'peas'
];

export default function RecipesPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = COMMON_INGREDIENTS.filter(
    ing => ing.toLowerCase().includes(inputValue.toLowerCase()) && 
    !ingredients.some(i => i.name.toLowerCase() === ing.toLowerCase())
  ).slice(0, 6);

  const addIngredient = (name: string) => {
    if (name.trim() && !ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      setIngredients([...ingredients, { id: Date.now().toString(), name: name.trim().toLowerCase() }]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const findRecipes = () => {
    const ingredientNames = ingredients.map(i => i.name.toLowerCase());
    
    const scored = RECIPE_DATABASE.map(recipe => {
      const matched = recipe.matchedIngredients.filter(ing => 
        ingredientNames.some(userIng => ing.toLowerCase().includes(userIng) || userIng.includes(ing.toLowerCase()))
      );
      return {
        ...recipe,
        matchedIngredients: matched,
        missingIngredients: recipe.matchedIngredients.filter(ing => !matched.includes(ing)),
        score: matched.length
      };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);

    setMatchedRecipes(scored);
  };

  const clearAll = () => {
    setIngredients([]);
    setMatchedRecipes([]);
    setSelectedRecipe(null);
  };

  return (
    <div 
      className="min-h-screen pt-24 pb-16"
      style={{ background: 'linear-gradient(180deg, #F4FFF8 0%, #ECFDF3 50%, #ffffff 100%)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#86EFAC]/50 shadow-sm mb-4">
            <svg className="w-5 h-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium text-[#16A34A]">Recipe Finder</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">What can I cook?</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Add the ingredients you have, and we&apos;ll find delicious recipes you can make.
          </p>
        </div>

        {/* Ingredient Input Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add your ingredients
          </label>
          
          <div className="relative mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Type an ingredient (e.g., tomato, chicken, rice)"
                  className="w-full px-4 py-3 bg-[#F4FFF8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
                
                {/* Suggestions dropdown */}
                {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
                    {filteredSuggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => addIngredient(suggestion)}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#F4FFF8] text-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => addIngredient(inputValue)}
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-[#16A34A] text-white rounded-xl font-medium hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Ingredient Tags */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map(ing => (
                <span
                  key={ing.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4FFF8] text-[#16A34A] rounded-full text-sm font-medium"
                >
                  {ing.name}
                  <button
                    onClick={() => removeIngredient(ing.id)}
                    className="w-4 h-4 rounded-full bg-[#86EFAC] hover:bg-[#16A34A] hover:text-white flex items-center justify-center text-[#16A34A] transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={findRecipes}
              disabled={ingredients.length === 0}
              className="flex-1 py-3 bg-[#16A34A] text-white rounded-xl font-semibold hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Recipes
            </button>
            {ingredients.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Suggestions */}
        {ingredients.length === 0 && (
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-3">Quick add popular ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {['tomato', 'onion', 'garlic', 'egg', 'rice', 'pasta', 'chicken', 'cheese'].map(ing => (
                <button
                  key={ing}
                  onClick={() => addIngredient(ing)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-all"
                >
                  + {ing}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Results */}
        {matchedRecipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Found {matchedRecipes.length} recipe{matchedRecipes.length !== 1 ? 's' : ''} you can make!
            </h2>
            
            <div className="grid gap-4">
              {matchedRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#86EFAC] hover:shadow-lg cursor-pointer transition-all duration-300"
                  style={{
                    opacity: 0,
                    animation: `fadeUp 0.4s ease-out ${index * 100}ms forwards`
                  }}
                >
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-linear-to-br from-[#ECFDF3] to-[#F4FFF8] rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{recipe.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          recipe.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {recipe.time}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.matchedIngredients.map(ing => (
                          <span key={ing} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            ✓ {ing}
                          </span>
                        ))}
                        {recipe.missingIngredients.slice(0, 3).map(ing => (
                          <span key={ing} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                            + {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {matchedRecipes.length === 0 && ingredients.length > 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F4FFF8] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-500 text-sm">Try adding more ingredients or different ones.</p>
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecipe(null)}>
            <div 
              className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-[#ECFDF3] to-[#F4FFF8] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedRecipe.time} • {selectedRecipe.difficulty}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.matchedIngredients.map(ing => (
                      <span key={ing} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        ✓ {ing}
                      </span>
                    ))}
                    {selectedRecipe.missingIngredients.map(ing => (
                      <span key={ing} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        + {ing}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 bg-[#16A34A] text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-gray-700 text-sm pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="w-full mt-6 py-3 bg-[#16A34A] text-white rounded-xl font-semibold hover:bg-[#15803d] transition-all"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
