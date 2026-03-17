import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Profession {
  code: number;
  masculin: string;
  feminin: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionService {
  private jsonUrl = 'assets/data/professions.json';

  constructor(private http: HttpClient) {}

  getProfessions(): Observable<Profession[]> {
    return this.http.get<Profession[]>(this.jsonUrl);
  }

  getProfessionBySex(code: number, sexe: 'M' | 'F', professions: Profession[]): string {
    const prof = professions.find(p => p.code === code);
    if (!prof) return 'Profession inconnue';
    return sexe === 'F' ? prof.feminin : prof.masculin;
  }

  getNationalite(code: string | null | undefined): string {
    if (!code) return 'Nationalité inconnue';

    const normalizedCode = code.trim().toUpperCase();

    const nationalites: { [code: string]: string } = {
      'GN': 'Guinéenne',
      'CI': 'Ivoirienne',
      'SN': 'Sénégalaise',
      'ML': 'Malienne',
      'NE': 'Nigérienne',
      'NG': 'Nigériane',
      'MR': 'Mauritanienne',
      'BF': 'Burkinabè',
      'TG': 'Togolaise',
      'BJ': 'Béninoise',
      'GH': 'Ghanéenne',
      'GM': 'Gambienne',
      'SL': 'Sierraléonaise',
      'LR': 'Libérienne',
      'CM': 'Camerounaise',
      'TD': 'Tchadienne',
      'CF': 'Centrafricaine',
      'GA': 'Gabonaise',
      'CG': 'Congolaise (Brazzaville)',
      'CD': 'Congolaise (Kinshasa)',
      'AO': 'Angolaise',
      'ZW': 'Zimbabwéenne',
      'ZM': 'Zambienne',
      'MW': 'Malawite',
      'MZ': 'Mozambicaine',
      'MG': 'Malgache',
      'KE': 'Kényane',
      'TZ': 'Tanzanienne',
      'UG': 'Ougandaise',
      'ET': 'Éthiopienne',
      'ER': 'Érythréenne',
      'SO': 'Somalienne',
      'SD': 'Soudanaise',
      'SS': 'Sud-Soudanaise',
      'DZ': 'Algérienne',
      'TN': 'Tunisienne',
      'MA': 'Marocaine',
      'LY': 'Libyenne',
      'EG': 'Égyptienne',
      'NA': 'Namibienne',
      'BW': 'Botswanaise',
      'SZ': 'Eswatinienne',
      'LS': 'Lesothane',
      'RW': 'Rwandaise',
      'BI': 'Burundaise',
      'ST': 'Santoméenne',
      'CV': 'Cap-verdienne',
      'SC': 'Seychelloise',
      'KM': 'Comorienne',
      'GQ': 'Équato-guinéenne',
      'RE': 'Réunionnaise', // si besoin
      'YT': 'Mahoraise' // Mayotte
    };

    return nationalites[normalizedCode] || 'Nationalité inconnue';
  }
}
