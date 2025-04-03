
import { useEquipment } from "../hooks/useEquipment"

const EquipmentSummary = () => {
    const { filteredEquipment, stateHistory, loading, error } = useEquipment()

    if (loading) return <div>Carregando...</div>
    if (error) return <div>Erro ao carregar dados: {error}</div>

    const getCurrentState = (equipmentId: string) => {
        const states = stateHistory[equipmentId]
        if (!states?.length) return null
        return states[states.length - 1].equipmentStateId
    }

    const equipmentStats = {
        total: filteredEquipment.length,
        operating: filteredEquipment.filter(eq => getCurrentState(eq.id) === "0808344c-454b-4c36-89e8-d7687e692d57").length,
        stopped: filteredEquipment.filter(eq => getCurrentState(eq.id) === "baff9783-84e8-4e01-874b-6fd743b875ad").length,
        maintenance: filteredEquipment.filter(eq => getCurrentState(eq.id) === "03b2d446-e3ba-4c82-8dc2-a5611fea6e1f").length,
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-heading font-semibold mb-3">Resumo de Equipamentos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#C8E6C9] rounded-md p-3">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{equipmentStats.total}</p>
                </div>

                <div className="bg-[#2ecc71]/10 rounded-md p-3">
                    <p className="text-sm text-gray-600">Operando</p>
                    <p className="text-2xl font-bold text-[#2ecc71]">{equipmentStats.operating}</p>
                </div>

                <div className="bg-[#f1c40f]/10 rounded-md p-3">
                    <p className="text-sm text-gray-600">Parados</p>
                    <p className="text-2xl font-bold text-[#f1c40f]">{equipmentStats.stopped}</p>
                </div>

                <div className="bg-[#e74c3c]/10 rounded-md p-3">
                    <p className="text-sm text-gray-600">Manutenção</p>
                    <p className="text-2xl font-bold text-[#e74c3c]">{equipmentStats.maintenance}</p>
                </div>
            </div>
        </div>
    )
}

export default EquipmentSummary