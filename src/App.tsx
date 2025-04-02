import Map from "./components/Map"
import Header from "./components/Header"
import EquipmentSummary from "./components/EquipmentSummary"
import { EquipmentProvider } from "./contexts/EquipmentContext"

function App() {
  return (
    <EquipmentProvider>
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4">
            <EquipmentSummary />
          </main>
        </div>
      </div>
    </EquipmentProvider>
  );
}

export default App
