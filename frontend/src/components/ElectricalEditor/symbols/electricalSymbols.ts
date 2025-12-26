import { ElectricalSymbol } from '../../../types';

// Belgian AREI/RGIE Standard Electrical Symbols
export const electricalSymbols: ElectricalSymbol[] = [
  // ============ OUTLETS (Stopcontacten) ============
  {
    id: 'outlet-single',
    name: 'Stopcontact',
    category: 'outlets',
    icon: 'outlet-single',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { grounded: true, voltage: 230 }
  },
  {
    id: 'outlet-double',
    name: 'Dubbel Stopcontact',
    category: 'outlets',
    icon: 'outlet-double',
    defaultWidth: 40,
    defaultHeight: 30,
    properties: { grounded: true, voltage: 230, count: 2 }
  },
  {
    id: 'outlet-waterproof',
    name: 'Waterdicht Stopcontact',
    category: 'outlets',
    icon: 'outlet-waterproof',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { grounded: true, voltage: 230, ipRating: 'IP44' }
  },

  // ============ SWITCHES (Schakelaars) ============
  {
    id: 'switch-single',
    name: 'Enkelpolige Schakelaar',
    category: 'switches',
    icon: 'switch-single',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { poles: 1 }
  },
  {
    id: 'switch-double',
    name: 'Dubbelpolige Schakelaar',
    category: 'switches',
    icon: 'switch-double',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { poles: 2 }
  },
  {
    id: 'switch-dimmer',
    name: 'Dimmer',
    category: 'switches',
    icon: 'switch-dimmer',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { type: 'dimmer' }
  },
  {
    id: 'switch-motion',
    name: 'Bewegingsmelder',
    category: 'switches',
    icon: 'switch-motion',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { type: 'motion' }
  },
  {
    id: 'switch-twoway',
    name: 'Wisselschakelaar',
    category: 'switches',
    icon: 'switch-twoway',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { type: 'two-way' }
  },

  // ============ LIGHTING (Verlichting) ============
  {
    id: 'light-ceiling',
    name: 'Plafondlamp',
    category: 'lighting',
    icon: 'light-ceiling',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { mounting: 'ceiling' }
  },
  {
    id: 'light-wall',
    name: 'Wandlamp',
    category: 'lighting',
    icon: 'light-wall',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: { mounting: 'wall' }
  },
  {
    id: 'light-spot',
    name: 'Spot',
    category: 'lighting',
    icon: 'light-spot',
    defaultWidth: 24,
    defaultHeight: 24,
    properties: { type: 'spot' }
  },
  {
    id: 'light-fluorescent',
    name: 'TL-lamp',
    category: 'lighting',
    icon: 'light-fluorescent',
    defaultWidth: 60,
    defaultHeight: 20,
    properties: { type: 'fluorescent' }
  },

  // ============ DISTRIBUTION (Verdeling) ============
  {
    id: 'breaker-main',
    name: 'Hoofdschakelaar',
    category: 'distribution',
    icon: 'breaker-main',
    defaultWidth: 40,
    defaultHeight: 60,
    properties: { amperage: 40, poles: 4 }
  },
  {
    id: 'breaker-circuit',
    name: 'Automaat',
    category: 'distribution',
    icon: 'breaker-circuit',
    defaultWidth: 30,
    defaultHeight: 50,
    properties: { amperage: 20, poles: 2 }
  },
  {
    id: 'breaker-rcd',
    name: 'Differentieelschakelaar',
    category: 'distribution',
    icon: 'breaker-rcd',
    defaultWidth: 40,
    defaultHeight: 60,
    properties: { sensitivity: 30, amperage: 40 }
  },
  {
    id: 'meter-electric',
    name: 'Elektriciteitsmeter',
    category: 'distribution',
    icon: 'meter-electric',
    defaultWidth: 50,
    defaultHeight: 40,
    properties: { type: 'kWh' }
  },

  // ============ WIRING (Bedrading) ============
  {
    id: 'junction-box',
    name: 'Aftakdoos',
    category: 'wiring',
    icon: 'junction-box',
    defaultWidth: 24,
    defaultHeight: 24,
    properties: {}
  },
  {
    id: 'cable-duct',
    name: 'Kabelgoot',
    category: 'wiring',
    icon: 'cable-duct',
    defaultWidth: 60,
    defaultHeight: 20,
    properties: {}
  },

  // ============ SPECIAL (Speciaal) ============
  {
    id: 'doorbell',
    name: 'Deurbel',
    category: 'special',
    icon: 'doorbell',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: {}
  },
  {
    id: 'thermostat',
    name: 'Thermostaat',
    category: 'special',
    icon: 'thermostat',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: {}
  },
  {
    id: 'smoke-detector',
    name: 'Rookmelder',
    category: 'special',
    icon: 'smoke-detector',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: {}
  },
  {
    id: 'intercom',
    name: 'Parlofoon',
    category: 'special',
    icon: 'intercom',
    defaultWidth: 30,
    defaultHeight: 30,
    properties: {}
  },

  // ============ STRUCTURE (Structuur) ============
  {
    id: 'wall-horizontal',
    name: 'Muur Horizontaal',
    category: 'structure',
    icon: 'wall-horizontal',
    defaultWidth: 150,
    defaultHeight: 8,
    properties: { thickness: 8 }
  },
  {
    id: 'wall-vertical',
    name: 'Muur Verticaal',
    category: 'structure',
    icon: 'wall-vertical',
    defaultWidth: 8,
    defaultHeight: 150,
    properties: { thickness: 8 }
  },
  {
    id: 'wall-corner',
    name: 'Hoek Muur',
    category: 'structure',
    icon: 'wall-corner',
    defaultWidth: 60,
    defaultHeight: 60,
    properties: { thickness: 8 }
  },
  {
    id: 'door-single',
    name: 'Deur Links',
    category: 'structure',
    icon: 'door-single',
    defaultWidth: 80,
    defaultHeight: 80,
    properties: { swing: 'left', width: 80 }
  },
  {
    id: 'door-single-right',
    name: 'Deur Rechts',
    category: 'structure',
    icon: 'door-single-right',
    defaultWidth: 80,
    defaultHeight: 80,
    properties: { swing: 'right', width: 80 }
  },
  {
    id: 'door-double',
    name: 'Dubbele Deur',
    category: 'structure',
    icon: 'door-double',
    defaultWidth: 120,
    defaultHeight: 80,
    properties: { width: 120 }
  },
  {
    id: 'door-sliding',
    name: 'Schuifdeur',
    category: 'structure',
    icon: 'door-sliding',
    defaultWidth: 100,
    defaultHeight: 20,
    properties: { width: 100 }
  },
  {
    id: 'window-single',
    name: 'Raam',
    category: 'structure',
    icon: 'window-single',
    defaultWidth: 80,
    defaultHeight: 16,
    properties: { width: 80 }
  },
  {
    id: 'window-double',
    name: 'Dubbel Raam',
    category: 'structure',
    icon: 'window-double',
    defaultWidth: 120,
    defaultHeight: 16,
    properties: { width: 120 }
  },
  {
    id: 'room',
    name: 'Kamer',
    category: 'structure',
    icon: 'room',
    defaultWidth: 200,
    defaultHeight: 150,
    properties: { name: 'Kamer' }
  },
  {
    id: 'room-living',
    name: 'Living',
    category: 'structure',
    icon: 'room',
    defaultWidth: 250,
    defaultHeight: 200,
    properties: { name: 'Living' }
  },
  {
    id: 'room-kitchen',
    name: 'Keuken',
    category: 'structure',
    icon: 'room',
    defaultWidth: 180,
    defaultHeight: 150,
    properties: { name: 'Keuken' }
  },
  {
    id: 'room-bedroom',
    name: 'Slaapkamer',
    category: 'structure',
    icon: 'room',
    defaultWidth: 180,
    defaultHeight: 150,
    properties: { name: 'Slaapkamer' }
  },
  {
    id: 'room-bathroom',
    name: 'Badkamer',
    category: 'structure',
    icon: 'room',
    defaultWidth: 120,
    defaultHeight: 100,
    properties: { name: 'Badkamer' }
  },
  {
    id: 'room-hall',
    name: 'Gang',
    category: 'structure',
    icon: 'room',
    defaultWidth: 200,
    defaultHeight: 80,
    properties: { name: 'Gang' }
  },
  {
    id: 'room-wc',
    name: 'WC',
    category: 'structure',
    icon: 'room',
    defaultWidth: 80,
    defaultHeight: 100,
    properties: { name: 'Wc' }
  },
  {
    id: 'room-tech',
    name: 'Tech. Ruimte',
    category: 'structure',
    icon: 'room',
    defaultWidth: 100,
    defaultHeight: 100,
    properties: { name: 'Tech.ruimte' }
  },
  {
    id: 'stairs',
    name: 'Trap',
    category: 'structure',
    icon: 'stairs',
    defaultWidth: 100,
    defaultHeight: 200,
    properties: { steps: 12 }
  },

  // ============ LABELS (Labels) ============
  {
    id: 'text-label',
    name: 'Tekst',
    category: 'labels',
    icon: 'text-label',
    defaultWidth: 80,
    defaultHeight: 24,
    properties: { text: 'Label', fontSize: 14 }
  },
  {
    id: 'circuit-label',
    name: 'Circuit Label',
    category: 'labels',
    icon: 'circuit-label',
    defaultWidth: 40,
    defaultHeight: 24,
    properties: { circuit: 'A.1' }
  }
];

// Symbol categories for organization
export const symbolCategories = [
  { id: 'outlets', name: 'Stopcontacten', icon: '🔌' },
  { id: 'switches', name: 'Schakelaars', icon: '🔘' },
  { id: 'lighting', name: 'Verlichting', icon: '💡' },
  { id: 'distribution', name: 'Verdeling', icon: '⚡' },
  { id: 'wiring', name: 'Bedrading', icon: '🔗' },
  { id: 'special', name: 'Speciaal', icon: '🔔' },
  { id: 'structure', name: 'Structuur', icon: '🏠' },
  { id: 'labels', name: 'Labels', icon: '🏷️' }
];

// Get symbols by category
export const getSymbolsByCategory = (category: string): ElectricalSymbol[] => {
  return electricalSymbols.filter(s => s.category === category);
};

// Get symbol by ID
export const getSymbolById = (id: string): ElectricalSymbol | undefined => {
  return electricalSymbols.find(s => s.id === id);
};

// Wire types for connections
export const wireTypes = [
  { id: 'power', name: 'Fase (L)', color: '#8B4513', strokeWidth: 2 },       // Brown
  { id: 'neutral', name: 'Nul (N)', color: '#0066CC', strokeWidth: 2 },      // Blue
  { id: 'ground', name: 'Aarde (PE)', color: '#228B22', strokeWidth: 2 },    // Green
  { id: 'data', name: 'Data', color: '#FF6600', strokeWidth: 1, dashed: true }
];
