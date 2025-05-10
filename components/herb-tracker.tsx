"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { herbs, secondaries, extremePotions, getDefaultInventory } from "@/lib/data"
import type { InventoryState } from "@/lib/types"

export default function HerbTracker() {
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

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("rs3-herb-inventory", JSON.stringify(inventory))
  }, [inventory])

  const updateHerbQuantity = (id: string, quantity: number) => {
    setInventory((prev) => ({
      ...prev,
      herbs: {
        ...prev.herbs,
        [id]: Math.max(0, quantity),
      },
    }))
  }

  const updateSecondaryQuantity = (id: string, quantity: number) => {
    setInventory((prev) => ({
      ...prev,
      secondaries: {
        ...prev.secondaries,
        [id]: Math.max(0, quantity),
      },
    }))
  }

  const updateExtremePotionQuantity = (id: string, quantity: number) => {
    setInventory((prev) => ({
      ...prev,
      extremePotions: {
        ...prev.extremePotions,
        [id]: Math.max(0, quantity),
      },
    }))
  }

  const updateSuperPotionQuantity = (id: string, quantity: number) => {
    setInventory((prev) => ({
      ...prev,
      secondaries: {
        ...prev.secondaries,
        [id]: Math.max(0, quantity),
      },
    }))
  }

  const resetInventory = () => {
    if (confirm("Are you sure you want to reset your inventory?")) {
      setInventory(getDefaultInventory())
    }
  }

  // Filter super potions from secondaries
  const superPotions = secondaries.filter(
    (item) =>
      item.id === "super_attack" ||
      item.id === "super_strength" ||
      item.id === "super_defence" ||
      item.id === "super_ranging" ||
      item.id === "super_magic" ||
      item.id === "super_necromancy",
  )

  // Filter out super potions from secondaries for display
  const otherSecondaries = secondaries.filter(
    (item) =>
      item.id !== "super_attack" &&
      item.id !== "super_strength" &&
      item.id !== "super_defence" &&
      item.id !== "super_ranging" &&
      item.id !== "super_magic" &&
      item.id !== "super_necromancy",
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Herb Inventory</h2>
        <Button variant="destructive" onClick={resetInventory}>
          Reset All
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3 text-white">Herbs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {herbs.map((herb) => (
              <Card key={herb.id} className="bg-[#1a2e1a] border-[#2a5331]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center">
                      <img src={herb.image || "/placeholder.svg"} alt={herb.name} className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{herb.name}</p>
                      <Input
                        type="number"
                        min="0"
                        value={inventory.herbs[herb.id] || 0}
                        onChange={(e) => updateHerbQuantity(herb.id, Number.parseInt(e.target.value) || 0)}
                        className="h-7 mt-1 bg-[#0f1f0f] border-[#2a5331] text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-white">Extreme Potions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {extremePotions.map((potion) => (
              <Card key={potion.id} className="bg-[#1a2e1a] border-[#2a5331]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center">
                      <img src={potion.image || "/placeholder.svg"} alt={potion.name} className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{potion.name}</p>
                      <Input
                        type="number"
                        min="0"
                        value={inventory.extremePotions[potion.id] || 0}
                        onChange={(e) => updateExtremePotionQuantity(potion.id, Number.parseInt(e.target.value) || 0)}
                        className="h-7 mt-1 bg-[#0f1f0f] border-[#2a5331] text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-white">Super Potions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {superPotions.map((potion) => (
              <Card key={potion.id} className="bg-[#1a2e1a] border-[#2a5331]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center">
                      <img src={potion.image || "/placeholder.svg"} alt={potion.name} className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{potion.name}</p>
                      <Input
                        type="number"
                        min="0"
                        value={inventory.secondaries[potion.id] || 0}
                        onChange={(e) => updateSuperPotionQuantity(potion.id, Number.parseInt(e.target.value) || 0)}
                        className="h-7 mt-1 bg-[#0f1f0f] border-[#2a5331] text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-white">Secondaries & Ingredients</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {otherSecondaries.map((secondary) => (
              <Card key={secondary.id} className="bg-[#1a2e1a] border-[#2a5331]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center">
                      <img src={secondary.image || "/placeholder.svg"} alt={secondary.name} className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{secondary.name}</p>
                      <Input
                        type="number"
                        min="0"
                        value={inventory.secondaries[secondary.id] || 0}
                        onChange={(e) => updateSecondaryQuantity(secondary.id, Number.parseInt(e.target.value) || 0)}
                        className="h-7 mt-1 bg-[#0f1f0f] border-[#2a5331] text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
