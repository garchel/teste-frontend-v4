import Map from "./components/Map"
import Header from "./components/Header"
import EquipmentSummary from "./components/EquipmentSummary"
import EquipmentTable from "./components/EquipmentTable"
import Filter from "./components/Filter"
import { EquipmentProvider } from "./contexts/EquipmentContext"
import EquipmentDetails from "./components/EquipmentDetails"

function App() {
  return (
    <EquipmentProvider>
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3 space-y-4">
              <Filter />
              <div className="relative flex flex-col space-y-4">
                <EquipmentSummary />
                <EquipmentTable />
                <div className="absolute top-0 left-0 right-0 z-20">
                  <EquipmentDetails />
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex-grow h-[calc(100vh-200px)] md:h-auto overflow-hidden">
                <Map />
              </div>
            </div>
          </main>
        </div>
      </div>
    </EquipmentProvider>
  );
}

export default App
