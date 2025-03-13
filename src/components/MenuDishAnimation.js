"use client"

import MenuDish from "./MenuDish"

// Sample static data for menu dishes
const sampleDishes = [
  {
    name: "Grilled Salmon Bowl",
    cuisine: "Mediterranean",
    calories: 520,
    protein: "32g",
    fats: "24g",
    carbs: "38g",
    ingredients: ["Salmon", "Brown rice", "Avocado", "Cherry tomatoes", "Cucumber", "Lemon"],
  },
  {
    name: "Chicken Tikka Masala",
    cuisine: "Indian",
    calories: 650,
    protein: "45g",
    fats: "28g",
    carbs: "42g",
    ingredients: ["Chicken", "Yogurt", "Tomato sauce", "Basmati rice", "Spices", "Cream"],
  },
  {
    name: "Vegetable Stir Fry",
    cuisine: "Asian",
    calories: 380,
    protein: "15g",
    fats: "12g",
    carbs: "45g",
    ingredients: ["Tofu", "Broccoli", "Bell peppers", "Carrots", "Soy sauce", "Ginger"],
  },
  {
    name: "Beef Burrito Bowl",
    cuisine: "Mexican",
    calories: 720,
    protein: "38g",
    fats: "32g",
    carbs: "65g",
    ingredients: ["Ground beef", "Black beans", "Rice", "Avocado", "Salsa", "Cheese"],
  },
  {
    name: "Caprese Salad",
    cuisine: "Italian",
    calories: 320,
    protein: "14g",
    fats: "24g",
    carbs: "12g",
    ingredients: ["Tomatoes", "Mozzarella", "Basil", "Olive oil", "Balsamic glaze", "Salt"],
  },
  {
    name: "Sushi Platter",
    cuisine: "Japanese",
    calories: 550,
    protein: "28g",
    fats: "16g",
    carbs: "70g",
    ingredients: ["Salmon", "Tuna", "Rice", "Nori", "Avocado", "Cucumber"],
  },
  {
    name: "Greek Yogurt Bowl",
    cuisine: "Greek",
    calories: 380,
    protein: "22g",
    fats: "14g",
    carbs: "40g",
    ingredients: ["Greek yogurt", "Honey", "Granola", "Berries", "Almonds", "Chia seeds"],
  },
  {
    name: "Mushroom Risotto",
    cuisine: "Italian",
    calories: 480,
    protein: "12g",
    fats: "18g",
    carbs: "65g",
    ingredients: ["Arborio rice", "Mushrooms", "Parmesan", "White wine", "Onion", "Garlic"],
  },
  {
    name: "Falafel Wrap",
    cuisine: "Middle Eastern",
    calories: 450,
    protein: "18g",
    fats: "22g",
    carbs: "48g",
    ingredients: ["Falafel", "Hummus", "Pita bread", "Tomatoes", "Cucumber", "Tahini"],
  },
  {
    name: "Açaí Bowl",
    cuisine: "Brazilian",
    calories: 420,
    protein: "8g",
    fats: "16g",
    carbs: "65g",
    ingredients: ["Açaí puree", "Banana", "Granola", "Berries", "Coconut flakes", "Honey"],
  },
  {
    name: "Beef Pho",
    cuisine: "Vietnamese",
    calories: 520,
    protein: "35g",
    fats: "12g",
    carbs: "58g",
    ingredients: ["Rice noodles", "Beef", "Bean sprouts", "Basil", "Lime", "Broth"],
  },
  {
    name: "Quinoa Power Bowl",
    cuisine: "Fusion",
    calories: 480,
    protein: "18g",
    fats: "22g",
    carbs: "52g",
    ingredients: ["Quinoa", "Kale", "Sweet potato", "Chickpeas", "Avocado", "Tahini"],
  },
  {
    name: "Pad Thai",
    cuisine: "Thai",
    calories: 580,
    protein: "22g",
    fats: "18g",
    carbs: "75g",
    ingredients: ["Rice noodles", "Tofu", "Bean sprouts", "Peanuts", "Egg", "Lime"],
  },
  {
    name: "Shakshuka",
    cuisine: "Middle Eastern",
    calories: 420,
    protein: "18g",
    fats: "28g",
    carbs: "22g",
    ingredients: ["Eggs", "Tomatoes", "Bell peppers", "Onions", "Feta", "Spices"],
  },
  {
    name: "Bibimbap",
    cuisine: "Korean",
    calories: 560,
    protein: "24g",
    fats: "18g",
    carbs: "68g",
    ingredients: ["Rice", "Beef", "Spinach", "Carrots", "Egg", "Gochujang"],
  },
]

const MenuDishBackground = () => {
  // Create 5 rows with 3 dishes each
  const rows = [
    sampleDishes.slice(0, 3),
    sampleDishes.slice(3, 6),
    sampleDishes.slice(6, 9),
    sampleDishes.slice(9, 12),
    sampleDishes.slice(12, 15),
  ]

  // Dummy handleClick function that does nothing
  const handleClick = () => {}

  return (
    <div className="menu-dish-background">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`dish-row ${rowIndex % 2 === 0 ? "slide-right" : "slide-left"}`}>
          {row.map((dish, dishIndex) => (
            <div key={`${rowIndex}-${dishIndex}`} className="dish-item">
              <MenuDish menuDish={dish} like={false} dislike={false} handleClick={handleClick} />
            </div>
          ))}
          {/* Duplicate the dishes for seamless looping */}
          {row.map((dish, dishIndex) => (
            <div key={`${rowIndex}-${dishIndex}-duplicate`} className="dish-item">
              <MenuDish menuDish={dish} showLike={false} />
            </div>
          ))}
        </div>
      ))}

      <style>{`
        .menu-dish-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          transform: rotate(-45deg) scale(1.5);
          z-index: -1;
          pointer-events: none;
        }

        .dish-row {
          display: flex;
          animation-duration: 60s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          width: 200%;
        }

        .slide-right {
          animation-name: slideRight;
        }

        .slide-left {
          animation-name: slideLeft;
        }

        .dish-item {
          flex: 0 0 auto;
          width: 280px; /* Reduced from 300px to 280px */
          opacity: 0.4;
          transform: scale(0.75); /* Reduced from 0.8 to 0.75 */
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
}

export default MenuDishBackground

