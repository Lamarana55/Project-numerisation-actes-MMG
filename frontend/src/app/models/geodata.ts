export interface RegionDTO {
  code: string;
  nom: string;
}

export interface PaysDTO {
  code: string;
  nom: string;
  codeRegion: string;
  codeNumerique: string;
}

export interface PrefectureDTO {
  code: string;
  nom: string;
  regionCode: string;
}

export interface CommuneDTO {
  code: string;
  nom: string;
  prefectureCode: string;
}

export interface QuartierDTO {
  code: string;
  nom: string;
  codeCommune: string;
}

export interface VilleDTO {
  code: string;
  nom: string;
  codePays: string;
}
