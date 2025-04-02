
import { useEquipment } from "../hooks/useEquipment"

const EquipmentSummary = () => {
    const { equipment } = useEquipment()

    const equipmentStats = {
        total: equipment.length,
        operating: equipment.filter(eq => eq.currentState === "operating").length,
        stopped: equipment.filter(eq => eq.currentState === "stopped").length,
        maintenance: equipment.filter(eq => eq.currentState === "maintenance").length,
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-heading font-semibold mb-3">Resumo de Equipamentos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* <div className="bg-tertiary rounded-md p-3">
                    <p className="text-sm text-gray-600" >Total</p>
                    <p className="text-2x1 font-bold">{equipment.Stats.total}</p>
                </div> */}

                <div className="bg-green-100 rounded-md p-3">
                    <p className="text-sm text-gray-600">Operando</p>
                    <p className="text-2x1 font-bold text-equipment-operating">{equipmentStats.operating}</p>
                </div>

                <div className="bg-yellow-100 rounded-md p-3">
                    <p className="text-sm text-gray-600">Parados</p>
                    <p className="text-2x1 font-bold text-equipment-stopped">{equipmentStats.stopped}</p>
                </div>

                <div className="bg-red-100 rounded-md p-3">
                    <p className="text-sm text-gray-600">Manutenção</p>
                    <p className="text-2x1 font-bold text-equipment-maintenance">{equipmentStats.maintenance}</p>
                </div>
            </div>
        </div>
    )

}

export default EquipmentSummary;