import { createContext, useState, useEffect } from "react"
import { Equipment, EquipmentContextType } from "../types/equipment"

export const EquipmentContext = createContext<EquipmentContextType | null>(null)

export function EquipmentProvider({ children }:
    {children: React.ReactNode })
    {
        const [equipment, setEquipment] = useState<Equipment[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)

        useEffect(() => {
            const loadEquipment = async () => {
                try {
                    const response = await fetch('/data/equipment.json')
                    const data = await response.json()
                    setEquipment(data)
                } catch (err: unknown) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to load equipment data'
                    setError(errorMessage)
                } finally {
                    setLoading(false)
                }
            }

            loadEquipment()
        }, [])

        return (
            <EquipmentContext.Provider value={{ equipment, loading, error }}>
            {children}
            </EquipmentContext.Provider>
        )
    }
