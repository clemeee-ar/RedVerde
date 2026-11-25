import { ScenarioProvider, useScenario } from './state/scenario';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DesignerPage } from './pages/Designer';

import { TerritorialAnalysisPage } from './pages/TerritorialAnalysis';
import { BiodiversityPage } from './pages/Biodiversity';
import { ResultsPage } from './pages/Results';
import { DataUploadPage } from './pages/DataUpload';
import { TechnicalSheetsPage } from './pages/TechnicalSheets';
import { useTechnicalSheetExport } from './pages/TechnicalSheets/export';
import { computeCorridors } from './algorithms/leastCostPath';
import { EDGES } from './data/corridors';

function Shell() {
  const { activeModule, scenario, update, setActiveModule } = useScenario();
  const exportPdf = useTechnicalSheetExport();

  const handleExport = () => {
    const results = computeCorridors(EDGES, scenario.origen, scenario.destino, scenario.weights);
    if (results.optima) {
      exportPdf(results.optima, results.alt1, results.alt2);
    }
  };

  // Generar corredor desde la barra superior: calcula y navega al diseñador.
  const handleGenerate = () => {
    const results = computeCorridors(EDGES, scenario.origen, scenario.destino, scenario.weights);
    update({ generated: true, lastRunId: Date.now() });
    void results;
    setActiveModule('designer');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F5F7F5]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onGenerate={handleGenerate} onExport={handleExport} />
        <main className="flex-1 min-h-0">
          {activeModule === 'designer' && <DesignerPage onExport={handleExport} />}
          {activeModule === 'analysis' && <TerritorialAnalysisPage />}
          {activeModule === 'biodiversity' && <BiodiversityPage />}
          {activeModule === 'results' && <ResultsPage />}
          {activeModule === 'uploads' && <DataUploadPage />}
          {activeModule === 'sheets' && <TechnicalSheetsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ScenarioProvider>
      <Shell />
    </ScenarioProvider>
  );
}
