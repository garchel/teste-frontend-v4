import { useEquipment } from "../hooks/useEquipment"
import { useEffect, useState } from "react"

type EquipmentTableItem = {
    id: string,
    name: string,
    type: string,
    state: string,
    stateColor: string,
}

const EquipmentTable = () => {
    const {
        filteredEquipment,
        equipmentModels,
        equipmentStates,
        getEquipmentName,
        selectedDate,
        getEquipmentStateAtDate,
        getEquipmentPositionAtDate,
        loading,
        error,
        openEquipmentHistory
    } = useEquipment()

    const [tableData, setTableData] = useState<EquipmentTableItem[]>([])

    useEffect(() => {
        if (!loading && !error) {
            const processedData = filteredEquipment.map(eq => {
                // Get equipment info
                const model = equipmentModels.find(m => m.id === eq.equipmentModelId)

                // Get state at selected date
                const stateId = getEquipmentStateAtDate(eq.id, selectedDate);
                
                // Get state info
                const stateInfo = stateId ? equipmentStates.find(s => s.id === stateId) : null;
            
                return {
                    id: eq.id,
                    name: getEquipmentName(eq.id),
                    type: model?.name || 'Desconhecido',
                    state: stateInfo?.name || 'Desconhecido',
                    stateColor: stateInfo?.color || '#999',
                }
            })

            setTableData(processedData)
        }
    }, [loading, filteredEquipment, equipmentModels, equipmentStates, getEquipmentName, selectedDate, getEquipmentStateAtDate, getEquipmentPositionAtDate])

    if (loading) {
        return <div className="p-3 text-sm text-gray-500">Carregando...</div>
    }

    if (error) {
        return <div className="p-3 text-sm text-red-500">Erro ao carregar dados: {error}</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-medium text-gray-600">
                    Lista de Equipamentos
                </h2>
                <span className="text-xs text-gray-500">{tableData.length} equipamentos</span>
            </div>
            <div className="overflow-x-auto rounded-md border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {tableData.map((item) => (
                            <tr 
                                key={item.id} 
                                className="hover:bg-blue-50 transition-colors cursor-pointer"
                                onClick={() => openEquipmentHistory(item.id)}
                            >
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="text-gray-500 text-sm">{item.type}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="h-2.5 w-2.5 rounded-full mr-2" style={{backgroundColor: item.stateColor }}></span>
                                        <span className="text-sm">{item.state}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EquipmentTable