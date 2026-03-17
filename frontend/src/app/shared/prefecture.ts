// src/app/shared/prefectures.ts

export interface Prefecture {
  code: string;
  nom: string;
  region: string;
}

export const PREFECTURES_LIST: Prefecture[] = [
  // Région de Boké
  { code: 'BFA', nom: 'Boffa', region: 'Boké' },
  { code: 'BKE', nom: 'Boké', region: 'Boké' },
  { code: 'FRI', nom: 'Fria', region: 'Boké' },
  { code: 'GAL', nom: 'Gaoual', region: 'Boké' },
  { code: 'KDR', nom: 'Koundara', region: 'Boké' },

  // Région de Conakry
  { code: 'CKY', nom: 'Conakry', region: 'Conakry' },

  // Région de Faranah
  { code: 'DBL', nom: 'Dabola', region: 'Faranah' },
  { code: 'DGR', nom: 'Dinguiraye', region: 'Faranah' },
  { code: 'FRN', nom: 'Faranah', region: 'Faranah' },
  { code: 'KDG', nom: 'Kissidougou', region: 'Faranah' },

  // Région de Kankan
  { code: 'KKA', nom: 'Kankan', region: 'Kankan' },
  { code: 'KRN', nom: 'Kérouané', region: 'Kankan' },
  { code: 'KRS', nom: 'Kouroussa', region: 'Kankan' },
  { code: 'MDN', nom: 'Mandiana', region: 'Kankan' },
  { code: 'SGR', nom: 'Siguiri', region: 'Kankan' },

  // Région de Kindia
  { code: 'CYA', nom: 'Coyah', region: 'Kindia' },
  { code: 'DBK', nom: 'Dubréka', region: 'Kindia' },
  { code: 'FRC', nom: 'Forécariah', region: 'Kindia' },
  { code: 'KDA', nom: 'Kindia', region: 'Kindia' },
  { code: 'TML', nom: 'Télimélé', region: 'Kindia' },

  // Région de Labé
  { code: 'KBA', nom: 'Koubia', region: 'Labé' },
  { code: 'LBE', nom: 'Labé', region: 'Labé' },
  { code: 'LLM', nom: 'Lélouma', region: 'Labé' },
  { code: 'MLI', nom: 'Mali', region: 'Labé' },
  { code: 'TGE', nom: 'Tougué', region: 'Labé' },

  // Région de Mamou
  { code: 'DLB', nom: 'Dalaba', region: 'Mamou' },
  { code: 'MMU', nom: 'Mamou', region: 'Mamou' },
  { code: 'PTA', nom: 'Pita', region: 'Mamou' },

  // Région de Nzérékoré
  { code: 'BLA', nom: 'Beyla', region: 'Nzérékoré' },
  { code: 'GKD', nom: 'Guéckédou', region: 'Nzérékoré' },
  { code: 'LLA', nom: 'Lola', region: 'Nzérékoré' },
  { code: 'MCT', nom: 'Macenta', region: 'Nzérékoré' },
  { code: 'ZKR', nom: 'Nzérékoré', region: 'Nzérékoré' },
  { code: 'YMU', nom: 'Yomou', region: 'Nzérékoré' }
];
