import { ScenarioProvider, useScenario } from '@/scenario';
import { Sidebar } from '@/layout/Sidebar';
import { Topbar } from '@/layout/Topbar';
import { DesignerPage } from '@/Designer';

import { TerritorialAnalysisPage } from '@/TerritorialAnalysis';
import { BiodiversityPage } from '@/Biodiversity';
import { ResultsPage } from '@/Results';
import { DataUploadPage } from '@/DataUpload';
import { TechnicalSheetsPage } from '@/TechnicalSheets';
import { useTechnicalSheetExport } from '@/TechnicalSheets/export';
import { computeCorridors } from '@/leastCostPath';
import { EDGES } from '@/corridors';

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
