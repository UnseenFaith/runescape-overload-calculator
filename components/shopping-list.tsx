"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, ArrowDown, CheckCircle2 } from "lucide-react"
import {
  herbs,
  secondaries,
  extremeRecipes,
  superRecipes,
  getDefaultInventory,
  otherPotionRecipes,
  extremePotions,
} from "@/lib/data"
import type { InventoryState } from "@/lib/types"

type OverloadType =
  | "overload"
  | "supreme_overload"
  | "overload_salve"
  | "supreme_overload_salve"
  | "elder_overload"
  | "elder_overload_salve"

interface IngredientItem {
  id: string
  name: string
  quantity: number
  image: string
  have: number
  need: number
  sufficient: boolean
}

export default function ShoppingList() {
  const [desiredAmount, setDesiredAmount] = useState<number>(10)
  const [overloadType, setOverloadType] = useState<OverloadType>("overload")
  const [showResults, setShowResults] = useState<boolean>(false)
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [viewMode, setViewMode] = useState<"all" | "herbs" | "potions" | "secondaries" | "needed">("all")
  const [inventory, setInventory] = useState<InventoryState>(getDefaultInventory())

  // Load inventory from localStorage on component mount
  useEffect(() => {
    const savedInventory = localStorage.getItem("rs3-herb-inventory")
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory))
      } catch (e) {
        console.error("Failed to parse saved inventory", e)
      }
    }
  }, [])

  const calculateIngredients = () => {
    const requiredIngredients: Record<string, IngredientItem> = {}

    // Helper function to add an ingredient to our list
    const addIngredient = (id: string, name: string, quantity: number, image: string) => {
      // Get how many we already have in inventory
      let haveAmount = 0

      // Check herbs
      if (id in inventory.herbs) {
        haveAmount = inventory.herbs[id] || 0
      }
      // Check secondaries (including super potions)
      else if (id in inventory.secondaries) {
        haveAmount = inventory.secondaries[id] || 0
      }
      // Check extreme potions
      else if (id in inventory.extremePotions) {
        haveAmount = inventory.extremePotions[id] || 0
      }

      // Calculate how many more we need
      const needAmount = Math.max(0, quantity - haveAmount)
      const sufficient = haveAmount >= quantity

      if (requiredIngredients[id]) {
        requiredIngredients[id].quantity += quantity
        requiredIngredients[id].need = Math.max(0, requiredIngredients[id].quantity - haveAmount)
        requiredIngredients[id].sufficient = haveAmount >= requiredIngredients[id].quantity
      } else {
        requiredIngredients[id] = {
          id,
          name,
          quantity,
          image,
          have: haveAmount,
          need: needAmount,
          sufficient,
        }
      }
    }

    // Find herb or secondary by ID
    const findItem = (id: string) => {
      const herb = herbs.find((h) => h.id === id)
      if (herb) return herb
      const secondary = secondaries.find((s) => s.id === id)
      return secondary
    }

    // Calculate ingredients for a potion from otherPotionRecipes
    const calculateOtherPotionIngredients = (potionId: string, amount: number) => {
      const recipe = otherPotionRecipes[potionId]
      if (!recipe) return

      if (recipe.herb) {
        const herb = findItem(recipe.herb)
        if (herb) {
          addIngredient(recipe.herb, herb.name, amount, herb.image)
        }
      }

      if (recipe.secondary) {
        const secondary = findItem(recipe.secondary)
        if (secondary) {
          const quantity = (recipe.quantity || 1) * amount
          addIngredient(recipe.secondary, secondary.name, quantity, secondary.image)
        }
      }

      // For potions that require other potions (like super antifire)
      if (recipe.potion) {
        const potion = findItem(recipe.potion)
        if (potion) {
          addIngredient(recipe.potion, potion.name, amount, potion.image)
          // Recursively calculate ingredients for the base potion
          calculateOtherPotionIngredients(recipe.potion, amount)
        }
      }
    }

    // Base overload ingredients
    addIngredient("torstol", "Clean Torstol", desiredAmount, findItem("torstol")?.image || "")

    // Add extreme potions (3-dose)
    const extremePotionsList = [
      "extreme_attack",
      "extreme_strength",
      "extreme_defence",
      "extreme_ranging",
      "extreme_magic",
      "extreme_necromancy",
    ]

    extremePotionsList.forEach((potionId) => {
      // For each extreme potion, we need one per overload
      const potionData = extremePotions.find((p) => p.id === potionId)

      if (potionData) {
        addIngredient(potionId, `${potionData.name.replace("(4)", "(3)")}`, desiredAmount, potionData.image)

        // Calculate ingredients for each extreme potion
        const recipe = extremeRecipes[potionId]
        if (recipe) {
          // Add herb if needed
          if (recipe.herb) {
            const herb = findItem(recipe.herb)
            if (herb) {
              addIngredient(recipe.herb, herb.name, desiredAmount, herb.image)
            }
          }

          // Add super potion
          const superPotionId = recipe.secondary
          const superPotion = findItem(superPotionId)
          if (superPotion) {
            addIngredient(superPotionId, superPotion.name, desiredAmount, superPotion.image)

            // Calculate ingredients for super potion
            const superRecipe = superRecipes[superPotionId]
            if (superRecipe) {
              const superHerb = findItem(superRecipe.herb)
              if (superHerb) {
                addIngredient(superRecipe.herb, superHerb.name, desiredAmount, superHerb.image)
              }

              const superSecondary = findItem(superRecipe.secondary)
              if (superSecondary) {
                const quantity = (superRecipe.quantity || 1) * desiredAmount
                addIngredient(superRecipe.secondary, superSecondary.name, quantity, superSecondary.image)
              }
            }
          }

          // Add other ingredient if needed
          if (recipe.other) {
            const other = findItem(recipe.other)
            if (other) {
              const quantity = (recipe.otherQuantity || 1) * desiredAmount
              addIngredient(recipe.other, other.name, quantity, other.image)
            }
          }
        }
      }
    })

    // Add additional ingredients based on overload type
    if (
      overloadType === "supreme_overload" ||
      overloadType === "supreme_overload_salve" ||
      overloadType === "elder_overload" ||
      overloadType === "elder_overload_salve"
    ) {
      // Supreme overload requires super potions
      const superPotions = [
        "super_attack",
        "super_strength",
        "super_defence",
        "super_ranging",
        "super_magic",
        "super_necromancy",
      ]

      superPotions.forEach((potionId) => {
        const potion = findItem(potionId)
        if (potion) {
          addIngredient(potionId, potion.name, desiredAmount, potion.image)

          // Calculate ingredients for super potion
          const recipe = superRecipes[potionId]
          if (recipe) {
            const herb = findItem(recipe.herb)
            if (herb) {
              addIngredient(recipe.herb, herb.name, desiredAmount, herb.image)
            }

            const secondary = findItem(recipe.secondary)
            if (secondary) {
              const quantity = (recipe.quantity || 1) * desiredAmount
              addIngredient(recipe.secondary, secondary.name, quantity, secondary.image)
            }
          }
        }
      })
    }

    // Add salve ingredients
    if (
      overloadType === "overload_salve" ||
      overloadType === "supreme_overload_salve" ||
      overloadType === "elder_overload_salve"
    ) {
      // Common ingredients for all salve potions
      const salveIngredients = ["prayer_renewal", "prayer_potion", "super_antifire", "antifire", "super_antipoison"]

      salveIngredients.forEach((id) => {
        const item = findItem(id)
        if (item) {
          addIngredient(id, item.name, desiredAmount, item.image)

          // Calculate ingredients for these potions
          calculateOtherPotionIngredients(id, desiredAmount)
        }
      })
    }

    // Add elder overload ingredients
    if (overloadType === "elder_overload" || overloadType === "elder_overload_salve") {
      // Elder overload requires primal extract and clean fellstalk
      const primalExtract = findItem("primal_extract")
      if (primalExtract) {
        addIngredient("primal_extract", primalExtract.name, desiredAmount, primalExtract.image)
      }

      const fellstalk = findItem("fellstalk")
      if (fellstalk) {
        addIngredient("fellstalk", fellstalk.name, desiredAmount, fellstalk.image)
      }
    }

    // Convert to array and sort
    const ingredientsList = Object.values(requiredIngredients)

    // Sort by type (herbs first, then potions, then secondaries)
    ingredientsList.sort((a, b) => {
      // Helper function to determine ingredient type
      const getType = (id: string) => {
        if (herbs.some((h) => h.id === id)) return 0 // Herbs
        if (
          id.includes("extreme_") ||
          id.includes("super_") ||
          id === "prayer_renewal" ||
          id === "prayer_potion" ||
          id === "antifire" ||
          id === "super_antifire" ||
          id === "super_antipoison"
        )
          return 1 // Potions
        return 2 // Secondaries
      }

      return getType(a.id) - getType(b.id) || a.name.localeCompare(b.name)
    })

    setIngredients(ingredientsList)
    setShowResults(true)
  }

  const filteredIngredients = () => {
    if (viewMode === "all") return ingredients

    if (viewMode === "herbs") {
      return ingredients.filter((item) => herbs.some((h) => h.id === item.id))
    }

    if (viewMode === "potions") {
      return ingredients.filter(
        (item) =>
          item.id.includes("extreme_") ||
          item.id.includes("super_") ||
          item.id === "prayer_renewal" ||
          item.id === "prayer_potion" ||
          item.id === "antifire" ||
          item.id === "super_antifire" ||
          item.id === "super_antipoison",
      )
    }

    if (viewMode === "secondaries") {
      return ingredients.filter(
        (item) =>
          !herbs.some((h) => h.id === item.id) &&
          !item.id.includes("extreme_") &&
          !item.id.includes("super_") &&
          item.id !== "prayer_renewal" &&
          item.id !== "prayer_potion" &&
          item.id !== "antifire" &&
          item.id !== "super_antifire" &&
          item.id !== "super_antipoison",
      )
    }

    if (viewMode === "needed") {
      return ingredients.filter((item) => !item.sufficient)
    }

    return ingredients
  }

  const getOverloadName = (type: OverloadType) => {
    switch (type) {
      case "overload":
        return "Overload"
      case "supreme_overload":
        return "Supreme Overload"
      case "overload_salve":
        return "Overload Salve"
      case "supreme_overload_salve":
        return "Supreme Overload Salve"
      case "elder_overload":
        return "Elder Overload"
      case "elder_overload_salve":
        return "Elder Overload Salve"
      default:
        return "Overload"
    }
  }

  // Count how many ingredients we still need to obtain
  const neededCount = ingredients.filter((item) => !item.sufficient).length

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <ShoppingBag className="h-6 w-6" />
        Shopping List Calculator
      </h2>

      <Card className="bg-[#1a2e1a] border-[#2a5331]">
        <CardHeader>
          <CardTitle className="text-white">Calculate Required Ingredients</CardTitle>
          <CardDescription className="text-gray-300">
            Enter the number of overloads you want to make and select the type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Number of Overloads</label>
              <Input
                type="number"
                min="1"
                value={desiredAmount}
                onChange={(e) => setDesiredAmount(Number(e.target.value) || 1)}
                className="bg-[#0f1f0f] border-[#2a5331] text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Overload Type</label>
              <Select value={overloadType} onValueChange={(value) => setOverloadType(value as OverloadType)}>
                <SelectTrigger className="bg-[#0f1f0f] border-[#2a5331] text-white">
                  <SelectValue placeholder="Select overload type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2e1a] border-[#2a5331] text-white">
                  <SelectItem value="overload">Overload</SelectItem>
                  <SelectItem value="supreme_overload">Supreme Overload</SelectItem>
                  <SelectItem value="overload_salve">Overload Salve</SelectItem>
                  <SelectItem value="supreme_overload_salve">Supreme Overload Salve</SelectItem>
                  <SelectItem value="elder_overload">Elder Overload</SelectItem>
                  <SelectItem value="elder_overload_salve">Elder Overload Salve</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculateIngredients} className="w-full bg-[#2a5331] hover:bg-[#3a7341] text-white">
            Calculate Ingredients
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              Ingredients for {desiredAmount} {getOverloadName(overloadType)}s
            </h3>
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-white" />
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
                <TabsList className="bg-[#1a2e1a] border border-[#2a5331]">
                  <TabsTrigger
                    value="all"
                    className="text-sm text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="needed"
                    className="text-sm text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white"
                  >
                    Needed ({neededCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="herbs"
                    className="text-sm text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white"
                  >
                    Herbs
                  </TabsTrigger>
                  <TabsTrigger
                    value="potions"
                    className="text-sm text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white"
                  >
                    Potions
                  </TabsTrigger>
                  <TabsTrigger
                    value="secondaries"
                    className="text-sm text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white"
                  >
                    Secondaries
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-2">
            {filteredIngredients().map((ingredient) => (
              <Card
                key={ingredient.id}
                className={`bg-[#1a2e1a] border-[#2a5331] ${ingredient.sufficient ? "border-l-4 border-l-green-500" : ""}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center">
                      <img src={ingredient.image || "/placeholder.svg"} alt={ingredient.name} className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{ingredient.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-300">Have: {ingredient.have}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-300">Need: {ingredient.need}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-lg font-bold text-white">{ingredient.quantity} total</p>
                      {ingredient.sufficient ? (
                        <span className="text-green-400 flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Sufficient
                        </span>
                      ) : (
                        <span className="text-yellow-400 text-sm">Need {ingredient.need} more</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
