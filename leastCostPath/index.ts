
import { CRITERIA } from '../../data/criteria';
import type {
  CorridorResult,
  EdgeIndicators,
  GraphEdge,
  LatLng,
  SegmentResult,
  Weights,
} from '../../types';

/**
 * Normaliza los pesos para que sumen 1.
 * Los valores negativos o no numéricos se consideran 0.
 */
export function normalizeWeights(w: Weights): Weights {
  const out: Weights = {};
  let total = 0;

  for (const c of CRITERIA) {
    const raw = Number(w[c.id] ?? 0);
    const value = Number.isFinite(raw) ? Math.max(0, raw) : 0;
    out[c.id] = value;
    total += value;
  }

  if (total <= 0) {
    for (const c of CRITERIA) {
      out[c.id] = 1 / CRITERIA.length;
    }
    return out;
  }

  for (const c of CRITERIA) {
    out[c.id] /= total;
  }

  return out;
}

/**
 * Convierte un indicador 0-100 en resistencia 0-1.
 * Beneficio y oportunidad: un valor alto reduce resistencia.
 * Resistencia: un valor alto aumenta resistencia.
 */
export function resistance(id: string, value: number): number {
  const def = CRITERIA.find((c) => c.id === id);
  if (!def) return 0;

  const safeValue = Number.isFinite(value) ? value : 0;
  const normalized = Math.min(100, Math.max(0, safeValue)) / 100;

  if (def.polarity === 'resistencia') return normalized;

  return 1 - normalized;
}

/**
 * Costo por kilómetro de una arista:
 *
 * C(e) = Σ [wᵢ × rᵢ(e)]
 *
 * Su rango teórico es 0-1.
 */
export function edgeCost(
  edge: GraphEdge | SegmentResult,
  wNorm: Weights
): number {
  let cost = 0;

  for (const c of CRITERIA) {
    const value =
      (edge.ind as unknown as Record<string, number>)[c.id] ?? 0;

    cost += (wNorm[c.id] ?? 0) * resistance(c.id, value);
  }

  return cost;
}

/**
 * Costo total de recorrer una arista.
 *
 * Integramos la resistencia a lo largo de su longitud:
 * C_total(e) = C(e) × longitud(e)
 *
 * La unidad resultante es resistencia-kilómetro.
 */
function edgeTotalCost(
  edge: GraphEdge,
  wNorm: Weights
): number {
  const length = Number.isFinite(edge.lengthKm)
    ? Math.max(0, edge.lengthKm)
    : 0;

  return edgeCost(edge, wNorm) * length;
}

interface DijkstraResult {
  path: string[];
  edges: GraphEdge[];
  costo: number;
}

interface DijkstraOptions {
  bannedEdges?: Set<string>;
  bannedNodes?: Set<string>;
}

/**
 * Dijkstra sobre un grafo no dirigido.
 *
 * Permite excluir aristas y nodos para calcular rutas alternativas.
 */
function dijkstra(
  edges: GraphEdge[],
  from: string,
  to: string,
  wNorm: Weights,
  options: DijkstraOptions = {}
): DijkstraResult | null {
  const bannedEdges = options.bannedEdges ?? new Set<string>();
  const bannedNodes = options.bannedNodes ?? new Set<string>();

  if (bannedNodes.has(from) || bannedNodes.has(to)) {
    return null;
  }

  const adjacency = new Map<
    string,
    { to: string; edge: GraphEdge }[]
  >();

  for (const edge of edges) {
    if (bannedEdges.has(edge.id)) continue;

    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);

    adjacency.get(edge.from)!.push({
      to: edge.to,
      edge,
    });

    adjacency.get(edge.to)!.push({
      to: edge.from,
      edge,
    });
  }

  if (!adjacency.has(from) || !adjacency.has(to)) {
    return null;
  }

  const distances = new Map<string, number>();
  const previous = new Map<
    string,
    { node: string; edge: GraphEdge }
  >();

  const visited = new Set<string>();

  for (const node of adjacency.keys()) {
    distances.set(node, Infinity);
  }

  distances.set(from, 0);

  while (true) {
    let current: string | null = null;
    let bestDistance = Infinity;

    for (const [node, distance] of distances) {
      if (!visited.has(node) && distance < bestDistance) {
        current = node;
        bestDistance = distance;
      }
    }

    if (current === null) break;
    if (current === to) break;

    visited.add(current);

    for (const neighbor of adjacency.get(current) ?? []) {
      const next = neighbor.to;
      const edge = neighbor.edge;

      if (visited.has(next) || bannedNodes.has(next)) continue;

      const candidateDistance =
        bestDistance + edgeTotalCost(edge, wNorm);

      if (candidateDistance < (distances.get(next) ?? Infinity)) {
        distances.set(next, candidateDistance);
        previous.set(next, {
          node: current,
          edge,
        });
      }
    }
  }

  const finalCost = distances.get(to);

  if (finalCost === undefined || !Number.isFinite(finalCost)) {
    return null;
  }

  const path = [to];
  const usedEdges: GraphEdge[] = [];

  let current = to;

  while (current !== from) {
    const previousStep = previous.get(current);

    if (!previousStep) return null;

    usedEdges.push(previousStep.edge);
    path.push(previousStep.node);
    current = previousStep.node;
  }

  return {
    path: path.reverse(),
    edges: usedEdges.reverse(),
    costo: finalCost,
  };
}

/**
 * Comprueba si dos rutas comparten el mismo prefijo de nodos
 * hasta una posición determinada.
 */
function sameRoot(
  a: string[],
  b: string[],
  length: number
): boolean {
  for (let i = 0; i <= length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

/**
 * Genera hasta K rutas simples de menor costo mediante el
 * algoritmo de Yen.
 *
 * A diferencia de la versión anterior, las alternativas:
 * - Se calculan a partir de la ruta óptima anterior.
 * - Excluyen temporalmente aristas y nodos para generar desvíos.
 * - Se ordenan por costo total real.
 * - No repiten una misma secuencia de aristas.
 */
function yenKShortestPaths(
  edges: GraphEdge[],
  from: string,
  to: string,
  wNorm: Weights,
  k: number
): DijkstraResult[] {
  const firstPath = dijkstra(edges, from, to, wNorm);

  if (!firstPath) return [];

  const accepted: DijkstraResult[] = [firstPath];
  const candidates = new Map<string, DijkstraResult>();

  const signature = (path: DijkstraResult) =>
    path.edges.map((edge) => edge.id).join('|');

  while (accepted.length < k) {
    const previousPath = accepted[accepted.length - 1];

    for (let i = 0; i < previousPath.path.length - 1; i++) {
      const spurNode = previousPath.path[i];

      const rootNodes = previousPath.path.slice(0, i + 1);
      const rootEdges = previousPath.edges.slice(0, i);

      const bannedEdges = new Set<string>();

      // Evita repetir los caminos aceptados que comparten
      // el mismo tramo inicial.
      for (const acceptedPath of accepted) {
        if (
          acceptedPath.path.length > i + 1 &&
          sameRoot(acceptedPath.path, rootNodes, i)
        ) {
          bannedEdges.add(acceptedPath.edges[i].id);
        }
      }

      // Evita ciclos dentro del tramo inicial.
      const bannedNodes = new Set(rootNodes.slice(0, -1));

      const spurPath = dijkstra(
        edges,
        spurNode,
        to,
        wNorm,
        { bannedEdges, bannedNodes }
      );

      if (!spurPath) continue;

      const combined: DijkstraResult = {
        path: [...rootNodes, ...spurPath.path.slice(1)],
        edges: [...rootEdges, ...spurPath.edges],
        costo:
          rootEdges.reduce(
            (sum, edge) => sum + edgeTotalCost(edge, wNorm),
            0
          ) + spurPath.costo,
      };

      const key = signature(combined);

      if (
        !accepted.some((route) => signature(route) === key) &&
        !candidates.has(key)
      ) {
        candidates.set(key, combined);
      }
    }

    if (candidates.size === 0) break;

    const bestCandidate = [...candidates.entries()].sort(
      (a, b) => a[1].costo - b[1].costo
    )[0];

    accepted.push(bestCandidate[1]);
    candidates.delete(bestCandidate[0]);
  }

  return accepted;
}

/**
 * Resume los indicadores de una ruta mediante promedio ponderado
 * por longitud. Así, un tramo largo tiene mayor representación
 * que uno corto.
 */
function summarize(segments: SegmentResult[]): {
  lengthKm: number;
  costoTotal: number;
  promInd: EdgeIndicators;
  anchoProm: number;
} {
  const lengthKm = segments.reduce(
    (sum, segment) => sum + segment.lengthKm,
    0
  );

  const safeLength = lengthKm > 0 ? lengthKm : 1;

  const keys = Object.keys(
    segments[0]?.ind ?? {}
  ) as (keyof EdgeIndicators)[];

  const promInd = {} as EdgeIndicators;

  for (const key of keys) {
    promInd[key] =
      segments.reduce(
        (sum, segment) =>
          sum + (segment.ind[key] ?? 0) * segment.lengthKm,
        0
      ) / safeLength;
  }

  const anchoProm =
    segments.reduce(
      (sum, segment) =>
        sum + segment.anchoProm * segment.lengthKm,
      0
    ) / safeLength;

  return {
    lengthKm,
    costoTotal: segments.reduce(
      (sum, segment) => sum + segment.costo,
      0
    ),
    promInd,
    anchoProm,
  };
}

/**
 * Convierte las aristas de una ruta en segmentos para la interfaz.
 */
function toSegments(
  edges: GraphEdge[],
  wNorm: Weights
): SegmentResult[] {
  return edges.map((edge) => ({
    edgeId: edge.id,
    nombre: edge.nombre,
    from: edge.from,
    to: edge.to,
    eje: edge.eje,
    lengthKm: edge.lengthKm,
    anchoProm: edge.anchoProm,
    ind: edge.ind,

    // Costo integrado: resistencia por kilómetro × longitud.
    costo: edgeTotalCost(edge, wNorm),

    latlngs: edge.latlngs as LatLng[],
  }));
}

/**
 * Calcula la ruta óptima y hasta dos alternativas.
 *
 * Retorna las tres rutas simples de menor costo encontradas
 * mediante Yen, ordenadas por costo total ponderado.
 */
export function computeCorridors(
  edges: GraphEdge[],
  origen: string,
  destino: string,
  weights: Weights
): {
  optima: CorridorResult | null;
  alt1: CorridorResult | null;
  alt2: CorridorResult | null;
} {
  if (!origen || !destino || origen === destino) {
    return {
      optima: null,
      alt1: null,
      alt2: null,
    };
  }

  const wNorm = normalizeWeights(weights);

  const routes = yenKShortestPaths(
    edges,
    origen,
    destino,
    wNorm,
    3
  );

  const build = (
    route: DijkstraResult | undefined,
    etiqueta: string,
    variant: CorridorResult['variant'],
    color: string
  ): CorridorResult | null => {
    if (!route || route.edges.length === 0) return null;

    const segments = toSegments(route.edges, wNorm);

    const {
      lengthKm,
      costoTotal,
      promInd,
      anchoProm,
    } = summarize(segments);

    return {
      id: `${origen}-${destino}-${variant}`,
      etiqueta,
      variant,
      color,
      segments,
      lengthKm,
      costoTotal,
      promInd,
      anchoProm,
      indResumen: promInd,
    };
  };

  return {
    optima: build(
      routes[0],
      'Ruta recomendada',
      'optima',
      '#174D38'
    ),
    alt1: build(
      routes[1],
      'Alternativa 1',
      'alt1',
      '#397D91'
    ),
    alt2: build(
      routes[2],
      'Alternativa 2',
      'alt2',
      '#E7A44A'
    ),
  };
}

/** Costos económicos demostrativos derivados de los indicadores. */
export function economicEstimates(r: CorridorResult): {
  costoImplementacionUF: number;
  costoMantAnualUF: number;
  arboles: number;
  arbustos: number;
  superficieM2: number;
} {
  const superficieM2 = r.lengthKm * 1000 * r.anchoProm;

  const arboles = Math.round(superficieM2 * 0.12);
  const arbustos = Math.round(superficieM2 * 0.55);

  const costoImplUF = Math.round(
    (superficieM2 / 1000) *
      (28 + (r.promInd.costoImpl / 100) * 22)
  );

  const costoMantUF = Math.round(
    (superficieM2 / 1000) *
      (6 + (r.promInd.costoMant / 100) * 5)
  );

  return {
    costoImplementacionUF: costoImplUF,
    costoMantAnualUF: costoMantUF,
    arboles,
    arbustos,
    superficieM2: Math.round(superficieM2),
  };
}

/** Beneficios ambientales demostrativos derivados de indicadores. */
export function environmentalBenefits(r: CorridorResult) {
  const p = r.promInd;

  return {
    beneficioTermico: Math.round(
      ((p.temperatura / 100) * 0.8 + 0.4) * 100
    ) / 100,

    infiltracion: Math.round(
      ((p.humedad / 100) * 55 + 15) * 10
    ) / 10,

    escorrentia: Math.round(
      ((p.inundacion / 100) * 32 + 8) * 10
    ) / 10,

    conectividad: Math.round(
      ((p.conectividad / 100) * 45 + 25) * 10
    ) / 10,

    coberturaVegetal: Math.round(
      ((p.vegetacion / 100) * 30 + 10) * 10
    ) / 10,

    beneficioSocial: Math.round(
      (
        (p.vulnerabilidad / 100) * 40 +
        (p.densidad / 100) * 35 +
        15
      ) * 10
    ) / 10,
  };
}

export function formatUF(n: number): string {
  return new Intl.NumberFormat('es-CL').format(n) + ' UF';
}
