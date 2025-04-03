import { useState } from "react";
import { useEquipment } from "../hooks/useEquipment";

const Filter = () => {
    const {
        typeFilters,
        stateFilters,
        toggleTypeFilter,
        toggleStateFilter
    } = useEquipment();

    // Track which dropdown is open
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Toggle dropdown visibility
    const toggleDropdown = (dropdown: string) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    }

    // Count active filters
    const activeTypeFilters = typeFilters.filter(f => f.active).length;
    const activeStateFilters = stateFilters.filter(f => f.active).length;

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Filtros:</h2>

            <div className="flex flex-wrap gap-3">
                {/* Type Filter Dropdown */}
                <div className="relative">
                    <button 
                        className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium"
                        onClick={() => toggleDropdown('type')}
                    >
                        Tipo: {activeTypeFilters > 0 && <span className="ml-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{activeTypeFilters}</span>}
                        <svg className={`w-4 h-4 ml-2 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div 
                        className={`absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 transition-all duration-300 ease-in-out ${
                            openDropdown === 'type' 
                                ? 'opacity-100 transform translate-y-0' 
                                : 'opacity-0 transform -translate-y-2 pointer-events-none'
                        }`}
                    >
                        <div className="p-2">
                            {typeFilters.map(filter => (
                                <div key={filter.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleTypeFilter(filter.id)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${filter.active ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                        {filter.active && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-2 text-gray-700">{filter.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* State Filter Dropdown */}
                <div className="relative">
                    <button 
                        className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium"
                        onClick={() => toggleDropdown('state')}
                    >
                        Estado: {activeStateFilters > 0 && <span className="ml-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{activeStateFilters}</span>}
                        <svg className={`w-4 h-4 ml-2 transition-transform ${openDropdown === 'state' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div 
                        className={`absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 transition-all duration-300 ease-in-out ${
                            openDropdown === 'state' 
                                ? 'opacity-100 transform translate-y-0' 
                                : 'opacity-0 transform -translate-y-2 pointer-events-none'
                        }`}
                    >
                        <div className="p-2">
                            {stateFilters.map(filter => (
                                <div key={filter.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleStateFilter(filter.id)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${filter.active ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                        {filter.active && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-2 text-gray-700">{filter.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Filter