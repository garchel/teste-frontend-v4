import { useEquipment } from "../hooks/useEquipment"
import { useEffect, useState } from "react"

type EquipmentTableItem = {
    id: string,
    name: string,
    type: string,
    state: string,
    stateColor: string,
    latitude: number | null,
    longitute: number | null,

}

const EquipmentTable = () => {
    const {
        equipment,
        equipmentModels,
        positionHistory,
        stateHistory,
        equipmentStates,
        getEquipmentName,
        loading,
        error
    } = useEquipment()

    const [tableData, setTableData] = useState<EquipmentTableItem[]>([])

    useEffect(() => {
        if (!loading && !error && equipment.length > 0){
            const processedData = equipment.map(eq => {
                // Get equipment info
                const model = equipmentModels.find(m => m.id === eq.equipmentModelId)

                //Get latest position
                const positions = positionHistory[eq.id] || []
                let latitude = null
                let longitute = null

                if (positions.length >0) {
                    const sortedPositions = [...positions].sort((a,b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime())
                    
                    latitude = sortedPositions[0].lat
                    longitute = sortedPositions[0].lon
                }

                // Get latest state
                const states = stateHistory[eq.id] || []
                const latestState = states.length > 0 ? states[states.length - 1] : null


                // Get state info
                const stateInfo = latestState ? equipmentStates.find(s => s.id === latestState.equipmentStateId) : null
            
                return {
                    id: eq.id,
                    name: getEquipmentName(eq.id),
                    type: model?.name || 'Desconhecido',
                    state: stateInfo?.name || 'Desconhecido',
                    stateColor: stateInfo?.color || '#999',
                    latitude,
                    longitute,
                }
            })

            setTableData(processedData)
        }
    }, [loading, equipment, equipmentModels, positionHistory, stateHistory, equipmentStates, getEquipmentName])

    if (loading) {
        return <div className="p-4">Carregando...</div>
    }

    if (error) {
        return <div className="p-4 text-red-500">Erro ao carregar dados: {error}</div>
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
                Lista de Equipamentos
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Latitude
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Longitude
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-500">{item.type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="h-3 w-3 rounded-full mr-2" style={{backgroundColor: item.stateColor }}></span>
                                        <span>{item.state}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {item.latitude !== null ? item.latitude.toFixed(6) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {item.longitute!== null? item.longitute.toFixed(6) : 'N/A'}
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