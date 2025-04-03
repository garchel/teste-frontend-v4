import { useState } from "react";

type FilterOption = {
    id: string,
    label: string,
    active: boolean
}

const Filter = () => {
    const [typeFilters, setTypeFilters] = useState<FilterOption[]>([
        { id: 'truck', label: 'Caminhão', active: false },
        { id: 'tractor', label: 'Trator', active: false },
        { id: 'excavator', label: 'Escavadeira', active: false },
    ])

    const [stateFilters, setStateFilters] = useState<FilterOption[]>([
        { id: 'operating', label: 'Operando', active: false },
        { id: 'stopped', label: 'Parado', active: false },
        { id: 'maintenance', label: 'Manutenção', active: false },
    ])

    //Toggle type Filter
    const toggleTypeFilter = (id: string) => {
        const updateFilters = typeFilters.map(filter => 
            filter.id === id ? { ...filter, active: !filter.active } : filter)
        setTypeFilters(updateFilters)
    
    // Log the filter change
    const filter = typeFilters.find(f => f.id === id)
    if (filter) {
        const newState = !filter.active
        console.log(`Filtro de tipo "${filter.label}" ${newState ? 'ativado' : 'desativado'}`)
        }
    }

    // Toggle State Filter
    const toggleStateFilter = (id: string) => {
        const updatedFilters = stateFilters.map(filter => 
            filter.id === id ? { ...filter, active: !filter.active } : filter )
        setStateFilters(updatedFilters)

        // Log the filter change
        const filter = stateFilters.find(f => f.id === id)
        if (filter) {
            const newState = !filter.active
            console.log(`Filtro de estado "${filter.label}" ${newState ? 'ativado' : 'desativado'}`)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Filtros</h2>

            <div className="mb-4">
                <h3 className="text-mb font-medium mb-2 text-gray-700">Tipo:</h3>
                <div className="flex flex-wrap gap-2">
                    {typeFilters.map(filter => (
                        <button
                            key={filter.id}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                filter.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => toggleTypeFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
            </div>
        </div>

        <div>
            <h3 className="text-md font-medium mb-2 text-gray-700">Estado:</h3>
            <div className="flex flex-wrap gap-2">
                {stateFilters.map(filter => (
                    <button
                        key={filter.id}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            filter.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => toggleStateFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                ))}
            </div>
        </div>
    </div>
    )
}

export default Filter