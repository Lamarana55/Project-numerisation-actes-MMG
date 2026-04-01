export interface RegionDTO {
  id?: string;
  code: string;
  nom: string;
}

export interface PaysDTO {
  id?: string;
  code: string;
  nom: string;
  codeRegion: string;
  codeNumerique: string;
}

export interface PrefectureDTO {
  id?: string;
  code: string;
  nom: string;
  regionCode: string;
  codeRegion?: string;  // alias retourné par le backend
}

export interface CommuneDTO {
  id?: string;
  code: string;
  nom: string;
  codePrefecture: string;
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
