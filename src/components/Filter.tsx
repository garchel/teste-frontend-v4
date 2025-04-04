import { useState } from "react";
import { useEquipment } from "../hooks/useEquipment";

const Filter = () => {
    const {
        typeFilters,
        stateFilters,
        toggleTypeFilter,
        toggleStateFilter,
        selectedDate,
        updateSelectedDate,
    } = useEquipment();

    // Track which dropdown is open
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Toggle dropdown visibility
    const toggleDropdown = (dropdown: string) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    }

    // Lida com a mudança de datas
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value)
        if (!isNaN(newDate.getTime())){
            updateSelectedDate(newDate)
        }
    }

    // Count active filters
    const activeTypeFilters = typeFilters.filter(f => f.active).length;
    const activeStateFilters = stateFilters.filter(f => f.active).length;

    return (
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-600">Filtros</h2>
            </div>

            <div className="flex items-center gap-3">
                {/* Date Time Filter */}
                <div className="flex-1">
                    <input
                        type="datetime-local"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md shadow-sm focus:outline-none
                        focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
                        value={selectedDate.toISOString().slice(0, 16)}
                        onChange={handleDateChange} 
                        min="2021-02-01T00:00" 
                        max="2021-02-28T23:59"
                    />
                </div>

                {/* Type Filter Dropdown */}
                <div className="relative">
                    <button 
                        className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 
                        rounded-md text-gray-700 text-sm font-medium border border-blue-200 transition-colors"
                        onClick={() => toggleDropdown('type')}
                    >
                        Tipo
                        {activeTypeFilters > 0 && 
                            <span className="ml-1.5 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                {activeTypeFilters}
                            </span>
                        }
                        <svg className={`w-3 h-3 ml-1.5 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div 
                        className={`absolute left-0 mt-1 w-44 bg-white rounded-md shadow-lg z-10 transition-all duration-200 ease-in-out ${
                            openDropdown === 'type' 
                                ? 'opacity-100 transform translate-y-0' 
                                : 'opacity-0 transform -translate-y-2 pointer-events-none'
                        }`}
                    >
                        <div className="p-1.5">
                            {typeFilters.map(filter => (
                                <div key={filter.id} className="flex items-center p-1.5 hover:bg-gray-50 rounded cursor-pointer" onClick={() => toggleTypeFilter(filter.id)}>
                                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${filter.active ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                        {filter.active && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* State Filter Dropdown */}
                <div className="relative">
                    <button 
                        className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 
                        rounded-md text-gray-700 text-sm font-medium border border-purple-200 transition-colors"
                        onClick={() => toggleDropdown('state')}
                    >
                        Estado
                        {activeStateFilters > 0 && 
                            <span className="ml-1.5 bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                {activeStateFilters}
                            </span>
                        }
                        <svg className={`w-3 h-3 ml-1.5 transition-transform ${openDropdown === 'state' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div 
                        className={`absolute left-0 mt-1 w-44 bg-white rounded-md shadow-lg z-10 transition-all duration-200 ease-in-out ${
                            openDropdown === 'state' 
                                ? 'opacity-100 transform translate-y-0' 
                                : 'opacity-0 transform -translate-y-2 pointer-events-none'
                        }`}
                    >
                        <div className="p-1.5">
                            {stateFilters.map(filter => (
                                <div key={filter.id} className="flex items-center p-1.5 hover:bg-gray-50 rounded cursor-pointer" onClick={() => toggleStateFilter(filter.id)}>
                                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${filter.active ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
                                        {filter.active && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
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