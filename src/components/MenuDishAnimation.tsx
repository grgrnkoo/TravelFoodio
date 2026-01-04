"use client"

import { memo } from "react"
import MenuDishStatic from "./MenuDishStatic"

// Sample static data for menu dishes
const sampleDishes = [
  {
    name: "Grilled Salmon Bowl",
    cuisine: "Mediterranean",
    calories: 520,
    protein: 32,
    fats: 24,
    carbs: 38,
    ingredients: ["Salmon", "Brown rice", "Avocado", "Cherry tomatoes", "Cucumber", "Lemon"],
  },
  {
    name: "Chicken Tikka Masala",
    cuisine: "Indian",
    calories: 650,
    protein: 45,
    fats: 28,
    carbs: 42,
    ingredients: ["Chicken", "Yogurt", "Tomato sauce", "Basmati rice", "Spices", "Cream"],
  },
  {
    name: "Vegetable Stir Fry",
    cuisine: "Asian",
    calories: 380,
    protein: 15,
    fats: 12,
    carbs: 45,
    ingredients: ["Tofu", "Broccoli", "Bell peppers", "Carrots", "Soy sauce", "Ginger"],
  },
  {
    name: "Beef Burrito Bowl",
    cuisine: "Mexican",
    calories: 720,
    protein: 38,
    fats: 32,
    carbs: 65,
    ingredients: ["Ground beef", "Black beans", "Rice", "Avocado", "Salsa", "Cheese"],
  },
  {
    name: "Caprese Salad",
    cuisine: "Italian",
    calories: 320,
    protein: 14,
    fats: 24,
    carbs: 12,
    ingredients: ["Tomatoes", "Mozzarella", "Basil", "Olive oil", "Balsamic glaze", "Salt"],
  },
  {
    name: "Sushi Platter",
    cuisine: "Japanese",
    calories: 550,
    protein: 28,
    fats: 16,
    carbs: 70,
    ingredients: ["Salmon", "Tuna", "Rice", "Nori", "Avocado", "Cucumber"],
  },
  {
    name: "Greek Yogurt Bowl",
    cuisine: "Greek",
    calories: 380,
    protein: 22,
    fats: 14,
    carbs: 40,
    ingredients: ["Greek yogurt", "Honey", "Granola", "Berries", "Almonds", "Chia seeds"],
  },
  {
    name: "Mushroom Risotto",
    cuisine: "Italian",
    calories: 480,
    protein: 12,
    fats: 18,
    carbs: 65,
    ingredients: ["Arborio rice", "Mushrooms", "Parmesan", "White wine", "Onion", "Garlic"],
  },
  {
    name: "Falafel Wrap",
    cuisine: "Middle Eastern",
    calories: 450,
    protein: 18,
    fats: 22,
    carbs: 48,
    ingredients: ["Falafel", "Hummus", "Pita bread", "Tomatoes", "Cucumber", "Tahini"],
  },
  {
    name: "Açaí Bowl",
    cuisine: "Brazilian",
    calories: 420,
    protein: 8,
    fats: 16,
    carbs: 65,
    ingredients: ["Açaí puree", "Banana", "Granola", "Berries", "Coconut flakes", "Honey"],
  },
  {
    name: "Beef Pho",
    cuisine: "Vietnamese",
    calories: 520,
    protein: 35,
    fats: 12,
    carbs: 58,
    ingredients: ["Rice noodles", "Beef", "Bean sprouts", "Basil", "Lime", "Broth"],
  },
  {
    name: "Quinoa Power Bowl",
    cuisine: "Fusion",
    calories: 480,
    protein: 18,
    fats: 22,
    carbs: 52,
    ingredients: ["Quinoa", "Kale", "Sweet potato", "Chickpeas", "Avocado", "Tahini"],
  },
  {
    name: "Pad Thai",
    cuisine: "Thai",
    calories: 580,
    protein: 22,
    fats: 18,
    carbs: 75,
    ingredients: ["Rice noodles", "Tofu", "Bean sprouts", "Peanuts", "Egg", "Lime"],
  },
  {
    name: "Shakshuka",
    cuisine: "Middle Eastern",
    calories: 420,
    protein: 18,
    fats: 28,
    carbs: 22,
    ingredients: ["Eggs", "Tomatoes", "Bell peppers", "Onions", "Feta", "Spices"],
  },
  {
    name: "Bibimbap",
    cuisine: "Korean",
    calories: 560,
    protein: 24,
    fats: 18,
    carbs: 68,
    ingredients: ["Rice", "Beef", "Spinach", "Carrots", "Egg", "Gochujang"],
  },
]

const MenuDishBackground = memo(() => {
  // Create 5 rows with 3 dishes each
  const rows = [
    sampleDishes.slice(0, 4),
    sampleDishes.slice(3, 7),
    sampleDishes.slice(6, 10),
    sampleDishes.slice(9, 13),
    sampleDishes.slice(11, 15),
  ]

  type DishType = {
    name: string
    cuisine: string
    calories: number
    protein: number
    fats: number
    carbs: number
    ingredients: string[]
  }

  const StaticDishCard = ({ dish }: { dish: DishType }) => (
    <div className="rounded bg-white/10 text-xs px-2 py-1 shadow-md border border-white/10">
      <p>{dish.name}</p>
      <p className="opacity-60">{dish.cuisine}</p>
    </div>
  )

  return (
    <div className="menu-dish-background">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`dish-row ${rowIndex % 2 === 0 ? "slide-right" : "slide-left"}`}>
          {row.map((dish, dishIndex) => (
            <div key={`${rowIndex}-${dishIndex}`} className="dish-item">
              <MenuDishStatic menuDish={dish} index={`${rowIndex}-${dishIndex}`} />
            </div>
          ))}
          {/* Duplicate the dishes for seamless looping */}
          {row.map((dish, dishIndex) => (
            <div key={`${rowIndex}-${dishIndex}-duplicate`} className="dish-item">
              <MenuDishStatic menuDish={dish} index={`${rowIndex}-${dishIndex}-duplicate`} />
            </div>
          ))}
        </div>
      ))}

      <style>{`
        .menu-dish-background {
          position: fixed;
          top: 50%;
          left: 50%;
          width: 200vw;
          height: 200vh;
          overflow: hidden;
          transform: translate(-50%, -50%) rotate(-45deg) scale(1.2);
          z-index: -1;
          pointer-events: none;
          transform-origin: center;
        }

        .dish-row {
          display: flex;
          width: max-content;
          min-width: 200%;
          animation-duration: 60s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          justify-content: center;
        }

        .slide-right {
          animation-name: slideRight;
        }

        .slide-left {
          animation-name: slideLeft;
        }

        .dish-item {
          overflow: hidden;
          flex: 0 0 auto;
          opacity: 0.4;
          transform: scale(0.8);
          filter: blur(1px);
          transition: all 0.3s ease;
        }

        @keyframes slideRight {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0%);
          }
        }

        @keyframes slideLeft {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
})

export default MenuDishBackground

