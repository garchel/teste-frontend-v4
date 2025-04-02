
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import aikoLogo from "../assets/img/aiko.png";

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
          <div className="relative max-w-xs">
            <Input 
              type="text" 
              placeholder="Buscar equipamentos..." 
              className="pl-9 pr-4 py-2 w-full"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
