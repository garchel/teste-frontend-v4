import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useEquipment } from "../hooks/useEquipment";

const EquipmentSearch = () => {
  const { 
    filteredEquipment, 
    getEquipmentName, 
    openEquipmentHistory 
  } = useEquipment();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{id: string, name: string}>>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Atualizar resultados de busca quando o termo mudar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = filteredEquipment
      .filter(equipment => {
        const equipmentName = getEquipmentName(equipment.id).toLowerCase();
        const search = searchTerm.toLowerCase();
        return equipmentName.includes(search);
      })
      .map(equipment => ({
        id: equipment.id,
        name: getEquipmentName(equipment.id)
      }));

    setSearchResults(results);
    setIsDropdownOpen(results.length > 0);
  }, [searchTerm, filteredEquipment, getEquipmentName]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectEquipment = (equipmentId: string) => {
    openEquipmentHistory(equipmentId);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Input 
          type="text" 
          placeholder="Buscar equipamentos..." 
          className="pl-9 pr-4 py-2 w-full"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => searchTerm.trim() !== "" && setIsDropdownOpen(true)}
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute z-[2000] mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {searchResults.map((result) => (
              <li 
                key={result.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSelectEquipment(result.id)}
              >
                {result.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EquipmentSearch;