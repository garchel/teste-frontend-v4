
import { useEquipment } from "../hooks/useEquipment"
import { useEffect, useState } from "react"

const EquipmentSummary = () => {
    const { 
        filteredEquipment, 
        selectedDate, 
        getEquipmentStateAtDate, 
        loading, 
        error,
        selectedEquipmentId
    } = useEquipment()

    const [isVisible, setIsVisible] = useState(true)
    const [shouldRender, setShouldRender] = useState(true)

    // Update visibility based on selectedEquipmentId with improved handling
    useEffect(() => {
        if (selectedEquipmentId) {
            setIsVisible(false);
            // Wait for fade out to complete before removing from DOM
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Match the duration of the fade-out transition
            return () => clearTimeout(timer);
        } else {
            setShouldRender(true);
            // Small delay before fading in
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [selectedEquipmentId]);

    if (loading) return <div>Carregando...</div>
    if (error) return <div>Erro ao carregar dados: {error}</div>
    if (!shouldRender) return null;

    // Obter o estado do equipamento na data selecionada
    const getStateAtSelectedDate = (equipmentId: string) => {
        return getEquipmentStateAtDate(equipmentId, selectedDate);
    }

    const equipmentStats = {
        total: filteredEquipment.length,
        operating: filteredEquipment.filter(eq => getStateAtSelectedDate(eq.id) === "0808344c-454b-4c36-89e8-d7687e692d57").length,
        stopped: filteredEquipment.filter(eq => getStateAtSelectedDate(eq.id) === "baff9783-84e8-4e01-874b-6fd743b875ad").length,
        maintenance: filteredEquipment.filter(eq => getStateAtSelectedDate(eq.id) === "03b2d446-e3ba-4c82-8dc2-a5611fea6e1f").length,
    }

    // Apply CSS classes for fade animation
    const fadeClass = isVisible 
        ? "opacity-100 transition-opacity duration-300 ease-in" 
        : "opacity-0 transition-opacity duration-300 ease-out";

    return (
        <div className={`bg-white rounded-lg shadow-sm p-3 ${fadeClass}`}>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-600">Resumo de Equipamentos</h2>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    Total: {equipmentStats.total}
                </span>
            </div>
            
            <div className="flex space-x-3">
                <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 rounded-md px-3 py-1.5">
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#2ecc71] mr-1.5"></div>
                        <span className="text-xs text-gray-700">Operando:</span>
                        <span className="text-sm font-bold text-[#2ecc71] ml-1">{equipmentStats.operating}</span>
                    </div>
                </div>
                
                <div className="flex-1 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-md px-3 py-1.5">
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#f1c40f] mr-1.5"></div>
                        <span className="text-xs text-gray-700">Parados:</span>
                        <span className="text-sm font-bold text-[#f1c40f] ml-1">{equipmentStats.stopped}</span>
                    </div>
                </div>
                
                <div className="flex-1 bg-gradient-to-r from-red-50 to-red-100 rounded-md px-3 py-1.5">
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#e74c3c] mr-1.5"></div>
                        <span className="text-xs text-gray-700">Manutenção:</span>
                        <span className="text-sm font-bold text-[#e74c3c] ml-1">{equipmentStats.maintenance}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EquipmentSummary