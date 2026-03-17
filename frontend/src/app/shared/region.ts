export interface Region {
  code: string;
  nom: string;
}

export const REGIONS_LIST: Region[] = [
  // Afrique
  { code: '015', nom: 'Afrique du Nord' },
  { code: '011', nom: 'Afrique de l\'Ouest' },
  { code: '017', nom: 'Afrique Centrale' },
  { code: '014', nom: 'Afrique de l\'Est' },
  { code: '018', nom: 'Afrique Australe' },

  // Amérique
  { code: '021', nom: 'Amérique du Nord' },
  { code: '029', nom: 'Caraïbes' },
  { code: '013', nom: 'Amérique Centrale' },
  { code: '005', nom: 'Amérique du Sud' },

  // Asie
  { code: '143', nom: 'Asie Centrale' },
  { code: '030', nom: 'Asie de l\'Est' },
  { code: '034', nom: 'Asie du Sud' },
  { code: '035', nom: 'Asie du Sud-Est' },
  { code: '145', nom: 'Asie de l\'Ouest' },

  // Europe
  { code: '151', nom: 'Europe de l\'Est' },
  { code: '154', nom: 'Europe du Nord' },
  { code: '039', nom: 'Europe Australe ou du Sud' },
  { code: '155', nom: 'Europe de l\'Ouest' },
  { code: '150', nom: 'Europe Centrale' },

  // Océanie
  { code: '053', nom: 'Australasie' },
  { code: '054', nom: 'Mélanésie' },
  { code: '057', nom: 'Micronésie' },
  { code: '061', nom: 'Polynésie' }
];
