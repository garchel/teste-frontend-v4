
import aikoLogo from "../assets/img/aiko.png";
import EquipmentSearch from "./EquipmentSearch";

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={aikoLogo}
            alt="Gear Tracker Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-heading font-bold">Gear Tracker</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative max-w-xs w-64">
            <EquipmentSearch />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
