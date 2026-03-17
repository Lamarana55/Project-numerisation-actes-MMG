export interface Ville {
  code: string; // Code unique de la ville
  nom: string;
  codePays: string; // ISO alpha-3
}

export const VILLE_LIST: Ville[] = [
  // Afghanistan (AFG)
  { code: 'AFG-KBL', nom: 'Kaboul', codePays: 'AFG' },
  { code: 'AFG-HER', nom: 'Herat', codePays: 'AFG' },
  { code: 'AFG-KDH', nom: 'Kandahar', codePays: 'AFG' },
  { code: 'AFG-MZR', nom: 'Mazar-i-Sharif', codePays: 'AFG' },
  { code: 'AFG-JAA', nom: 'Jalalabad', codePays: 'AFG' },

  // Afrique du Sud (ZAF)
  { code: 'ZAF-JNB', nom: 'Johannesburg', codePays: 'ZAF' },
  { code: 'ZAF-CPT', nom: 'Le Cap', codePays: 'ZAF' },
  { code: 'ZAF-DUR', nom: 'Durban', codePays: 'ZAF' },
  { code: 'ZAF-PRY', nom: 'Pretoria', codePays: 'ZAF' },
  { code: 'ZAF-PLZ', nom: 'Port Elizabeth', codePays: 'ZAF' },
  { code: 'ZAF-BFN', nom: 'Bloemfontein', codePays: 'ZAF' },

  // Albanie (ALB)
  { code: 'ALB-TIA', nom: 'Tirana', codePays: 'ALB' },
  { code: 'ALB-DUR', nom: 'Durrës', codePays: 'ALB' },
  { code: 'ALB-VLO', nom: 'Vlorë', codePays: 'ALB' },
  { code: 'ALB-ELB', nom: 'Elbasan', codePays: 'ALB' },
  { code: 'ALB-SHK', nom: 'Shkodër', codePays: 'ALB' },

  // Algérie (DZA)
  { code: 'DZA-ALG', nom: 'Alger', codePays: 'DZA' },
  { code: 'DZA-ORN', nom: 'Oran', codePays: 'DZA' },
  { code: 'DZA-CST', nom: 'Constantine', codePays: 'DZA' },
  { code: 'DZA-ANN', nom: 'Annaba', codePays: 'DZA' },
  { code: 'DZA-BAT', nom: 'Batna', codePays: 'DZA' },
  { code: 'DZA-BLI', nom: 'Blida', codePays: 'DZA' },
  { code: 'DZA-STF', nom: 'Sétif', codePays: 'DZA' },
  { code: 'DZA-SBA', nom: 'Sidi Bel Abbès', codePays: 'DZA' },

  // Allemagne (DEU)
  { code: 'DEU-BER', nom: 'Berlin', codePays: 'DEU' },
  { code: 'DEU-MUC', nom: 'Munich', codePays: 'DEU' },
  { code: 'DEU-FRA', nom: 'Francfort', codePays: 'DEU' },
  { code: 'DEU-HAM', nom: 'Hambourg', codePays: 'DEU' },
  { code: 'DEU-CGN', nom: 'Cologne', codePays: 'DEU' },
  { code: 'DEU-STR', nom: 'Stuttgart', codePays: 'DEU' },
  { code: 'DEU-DUS', nom: 'Düsseldorf', codePays: 'DEU' },
  { code: 'DEU-DOR', nom: 'Dortmund', codePays: 'DEU' },
  { code: 'DEU-ESS', nom: 'Essen', codePays: 'DEU' },
  { code: 'DEU-LEI', nom: 'Leipzig', codePays: 'DEU' },

  // Andorre (AND)
  { code: 'AND-ALV', nom: 'Andorre-la-Vieille', codePays: 'AND' },
  { code: 'AND-ESC', nom: 'Escaldes-Engordany', codePays: 'AND' },

  // Angola (AGO)
  { code: 'AGO-LAD', nom: 'Luanda', codePays: 'AGO' },
  { code: 'AGO-HUO', nom: 'Huambo', codePays: 'AGO' },
  { code: 'AGO-LOB', nom: 'Lobito', codePays: 'AGO' },
  { code: 'AGO-BEN', nom: 'Benguela', codePays: 'AGO' },
  { code: 'AGO-LUB', nom: 'Lubango', codePays: 'AGO' },

  // Antigua-et-Barbuda (ATG)
  { code: 'ATG-STJ', nom: 'Saint John\'s', codePays: 'ATG' },

  // Arabie saoudite (SAU)
  { code: 'SAU-RUH', nom: 'Riyad', codePays: 'SAU' },
  { code: 'SAU-JED', nom: 'Djeddah', codePays: 'SAU' },
  { code: 'SAU-MED', nom: 'Médine', codePays: 'SAU' },
  { code: 'SAU-MEC', nom: 'La Mecque', codePays: 'SAU' },
  { code: 'SAU-DAM', nom: 'Dammam', codePays: 'SAU' },
  { code: 'SAU-TAI', nom: 'Taïf', codePays: 'SAU' },

  // Argentine (ARG)
  { code: 'ARG-BUE', nom: 'Buenos Aires', codePays: 'ARG' },
  { code: 'ARG-COR', nom: 'Córdoba', codePays: 'ARG' },
  { code: 'ARG-ROS', nom: 'Rosario', codePays: 'ARG' },
  { code: 'ARG-MDZ', nom: 'Mendoza', codePays: 'ARG' },
  { code: 'ARG-TUC', nom: 'San Miguel de Tucumán', codePays: 'ARG' },
  { code: 'ARG-LPL', nom: 'La Plata', codePays: 'ARG' },

  // Arménie (ARM)
  { code: 'ARM-EVN', nom: 'Erevan', codePays: 'ARM' },
  { code: 'ARM-GYU', nom: 'Gyumri', codePays: 'ARM' },
  { code: 'ARM-VAN', nom: 'Vanadzor', codePays: 'ARM' },

  // Australie (AUS)
  { code: 'AUS-SYD', nom: 'Sydney', codePays: 'AUS' },
  { code: 'AUS-MEL', nom: 'Melbourne', codePays: 'AUS' },
  { code: 'AUS-BNE', nom: 'Brisbane', codePays: 'AUS' },
  { code: 'AUS-PER', nom: 'Perth', codePays: 'AUS' },
  { code: 'AUS-CBR', nom: 'Canberra', codePays: 'AUS' },
  { code: 'AUS-ADL', nom: 'Adélaïde', codePays: 'AUS' },
  { code: 'AUS-GCS', nom: 'Gold Coast', codePays: 'AUS' },

  // Autriche (AUT)
  { code: 'AUT-VIE', nom: 'Vienne', codePays: 'AUT' },
  { code: 'AUT-SZG', nom: 'Salzbourg', codePays: 'AUT' },
  { code: 'AUT-INN', nom: 'Innsbruck', codePays: 'AUT' },
  { code: 'AUT-GRZ', nom: 'Graz', codePays: 'AUT' },
  { code: 'AUT-LNZ', nom: 'Linz', codePays: 'AUT' },

  // Azerbaïdjan (AZE)
  { code: 'AZE-BAK', nom: 'Bakou', codePays: 'AZE' },
  { code: 'AZE-GAN', nom: 'Gandja', codePays: 'AZE' },
  { code: 'AZE-SUM', nom: 'Soumgaït', codePays: 'AZE' },

  // Bahamas (BHS)
  { code: 'BHS-NAS', nom: 'Nassau', codePays: 'BHS' },
  { code: 'BHS-FPO', nom: 'Freeport', codePays: 'BHS' },

  // Bahreïn (BHR)
  { code: 'BHR-MAN', nom: 'Manama', codePays: 'BHR' },
  { code: 'BHR-RIF', nom: 'Riffa', codePays: 'BHR' },
  { code: 'BHR-MUH', nom: 'Muharraq', codePays: 'BHR' },

  // Bangladesh (BGD)
  { code: 'BGD-DAC', nom: 'Dhaka', codePays: 'BGD' },
  { code: 'BGD-CHT', nom: 'Chittagong', codePays: 'BGD' },
  { code: 'BGD-KHL', nom: 'Khulna', codePays: 'BGD' },
  { code: 'BGD-RAJ', nom: 'Rajshahi', codePays: 'BGD' },
  { code: 'BGD-SYL', nom: 'Sylhet', codePays: 'BGD' },

  // Barbade (BRB)
  { code: 'BRB-BGI', nom: 'Bridgetown', codePays: 'BRB' },

  // Belgique (BEL)
  { code: 'BEL-BRU', nom: 'Bruxelles', codePays: 'BEL' },
  { code: 'BEL-ANR', nom: 'Anvers', codePays: 'BEL' },
  { code: 'BEL-GNT', nom: 'Gand', codePays: 'BEL' },
  { code: 'BEL-LIE', nom: 'Liège', codePays: 'BEL' },
  { code: 'BEL-CHR', nom: 'Charleroi', codePays: 'BEL' },
  { code: 'BEL-BRG', nom: 'Bruges', codePays: 'BEL' },
  { code: 'BEL-NAM', nom: 'Namur', codePays: 'BEL' },
  { code: 'BEL-LEU', nom: 'Louvain', codePays: 'BEL' },
  { code: 'BEL-MON', nom: 'Mons', codePays: 'BEL' },
  { code: 'BEL-AAL', nom: 'Alost', codePays: 'BEL' },
  { code: 'BEL-MEC', nom: 'Malines', codePays: 'BEL' },
  { code: 'BEL-VER', nom: 'Verviers', codePays: 'BEL' },
  { code: 'BEL-TOU', nom: 'Tournai', codePays: 'BEL' },
  { code: 'BEL-GEN', nom: 'Genk', codePays: 'BEL' },
  { code: 'BEL-OST', nom: 'Ostende', codePays: 'BEL' },

  // Belize (BLZ)
  { code: 'BLZ-BZE', nom: 'Belmopan', codePays: 'BLZ' },
  { code: 'BLZ-BZC', nom: 'Belize City', codePays: 'BLZ' },

  // Bénin (BEN)
  { code: 'BEN-COO', nom: 'Cotonou', codePays: 'BEN' },
  { code: 'BEN-PNR', nom: 'Porto-Novo', codePays: 'BEN' },
  { code: 'BEN-PAR', nom: 'Parakou', codePays: 'BEN' },
  { code: 'BEN-DJO', nom: 'Djougou', codePays: 'BEN' },
  { code: 'BEN-BOH', nom: 'Bohicon', codePays: 'BEN' },

  // Bhoutan (BTN)
  { code: 'BTN-THI', nom: 'Thimphou', codePays: 'BTN' },
  { code: 'BTN-PHU', nom: 'Phuentsholing', codePays: 'BTN' },

  // Biélorussie (BLR)
  { code: 'BLR-MSQ', nom: 'Minsk', codePays: 'BLR' },
  { code: 'BLR-GOM', nom: 'Gomel', codePays: 'BLR' },
  { code: 'BLR-BRE', nom: 'Brest', codePays: 'BLR' },
  { code: 'BLR-GRO', nom: 'Grodno', codePays: 'BLR' },
  { code: 'BLR-VIT', nom: 'Vitebsk', codePays: 'BLR' },

  // Bolivie (BOL)
  { code: 'BOL-LPB', nom: 'La Paz', codePays: 'BOL' },
  { code: 'BOL-SCZ', nom: 'Santa Cruz', codePays: 'BOL' },
  { code: 'BOL-SRE', nom: 'Sucre', codePays: 'BOL' },
  { code: 'BOL-CBB', nom: 'Cochabamba', codePays: 'BOL' },
  { code: 'BOL-ORU', nom: 'Oruro', codePays: 'BOL' },

  // Bosnie-Herzégovine (BIH)
  { code: 'BIH-SJJ', nom: 'Sarajevo', codePays: 'BIH' },
  { code: 'BIH-BNL', nom: 'Banja Luka', codePays: 'BIH' },
  { code: 'BIH-TUZ', nom: 'Tuzla', codePays: 'BIH' },

  // Botswana (BWA)
  { code: 'BWA-GBE', nom: 'Gaborone', codePays: 'BWA' },
  { code: 'BWA-FRW', nom: 'Francistown', codePays: 'BWA' },

  // Brésil (BRA)
  { code: 'BRA-SAO', nom: 'São Paulo', codePays: 'BRA' },
  { code: 'BRA-RIO', nom: 'Rio de Janeiro', codePays: 'BRA' },
  { code: 'BRA-BSB', nom: 'Brasília', codePays: 'BRA' },
  { code: 'BRA-SSA', nom: 'Salvador', codePays: 'BRA' },
  { code: 'BRA-FOR', nom: 'Fortaleza', codePays: 'BRA' },
  { code: 'BRA-BHZ', nom: 'Belo Horizonte', codePays: 'BRA' },
  { code: 'BRA-MAO', nom: 'Manaus', codePays: 'BRA' },
  { code: 'BRA-CWB', nom: 'Curitiba', codePays: 'BRA' },
  { code: 'BRA-REC', nom: 'Recife', codePays: 'BRA' },
  { code: 'BRA-POA', nom: 'Porto Alegre', codePays: 'BRA' },

  // Brunei (BRN)
  { code: 'BRN-BWN', nom: 'Bandar Seri Begawan', codePays: 'BRN' },

  // Bulgarie (BGR)
  { code: 'BGR-SOF', nom: 'Sofia', codePays: 'BGR' },
  { code: 'BGR-PLV', nom: 'Plovdiv', codePays: 'BGR' },
  { code: 'BGR-VAR', nom: 'Varna', codePays: 'BGR' },
  { code: 'BGR-BUR', nom: 'Burgas', codePays: 'BGR' },
  { code: 'BGR-RUS', nom: 'Ruse', codePays: 'BGR' },

  // Burkina Faso (BFA)
  { code: 'BFA-OUA', nom: 'Ouagadougou', codePays: 'BFA' },
  { code: 'BFA-BOY', nom: 'Bobo-Dioulasso', codePays: 'BFA' },
  { code: 'BFA-KDG', nom: 'Koudougou', codePays: 'BFA' },
  { code: 'BFA-OHG', nom: 'Ouahigouya', codePays: 'BFA' },
  { code: 'BFA-BAN', nom: 'Banfora', codePays: 'BFA' },

  // Burundi (BDI)
  { code: 'BDI-BJM', nom: 'Bujumbura', codePays: 'BDI' },
  { code: 'BDI-GIT', nom: 'Gitega', codePays: 'BDI' },
  { code: 'BDI-NGO', nom: 'Ngozi', codePays: 'BDI' },

  // Cambodge (KHM)
  { code: 'KHM-PNH', nom: 'Phnom Penh', codePays: 'KHM' },
  { code: 'KHM-REP', nom: 'Siem Reap', codePays: 'KHM' },
  { code: 'KHM-BAT', nom: 'Battambang', codePays: 'KHM' },
  { code: 'KHM-KOS', nom: 'Sihanoukville', codePays: 'KHM' },

  // Cameroun (CMR)
  { code: 'CMR-YAO', nom: 'Yaoundé', codePays: 'CMR' },
  { code: 'CMR-DLA', nom: 'Douala', codePays: 'CMR' },
  { code: 'CMR-GAR', nom: 'Garoua', codePays: 'CMR' },
  { code: 'CMR-BUE', nom: 'Buea', codePays: 'CMR' },
  { code: 'CMR-BAM', nom: 'Bamenda', codePays: 'CMR' },
  { code: 'CMR-BAF', nom: 'Bafoussam', codePays: 'CMR' },

  // Canada (CAN)
  { code: 'CAN-YOW', nom: 'Ottawa', codePays: 'CAN' },
  { code: 'CAN-YTO', nom: 'Toronto', codePays: 'CAN' },
  { code: 'CAN-YMQ', nom: 'Montréal', codePays: 'CAN' },
  { code: 'CAN-YVR', nom: 'Vancouver', codePays: 'CAN' },
  { code: 'CAN-YYC', nom: 'Calgary', codePays: 'CAN' },
  { code: 'CAN-YEG', nom: 'Edmonton', codePays: 'CAN' },
  { code: 'CAN-YWG', nom: 'Winnipeg', codePays: 'CAN' },
  { code: 'CAN-YQB', nom: 'Québec', codePays: 'CAN' },

  // Cap-Vert (CPV)
  { code: 'CPV-PRA', nom: 'Praia', codePays: 'CPV' },
  { code: 'CPV-MIN', nom: 'Mindelo', codePays: 'CPV' },

  // Chili (CHL)
  { code: 'CHL-SCL', nom: 'Santiago', codePays: 'CHL' },
  { code: 'CHL-VAP', nom: 'Valparaíso', codePays: 'CHL' },
  { code: 'CHL-CCP', nom: 'Concepción', codePays: 'CHL' },
  { code: 'CHL-ANF', nom: 'Antofagasta', codePays: 'CHL' },
  { code: 'CHL-LSC', nom: 'La Serena', codePays: 'CHL' },

  // Chine (CHN)
  { code: 'CHN-PEK', nom: 'Pékin', codePays: 'CHN' },
  { code: 'CHN-SHA', nom: 'Shanghai', codePays: 'CHN' },
  { code: 'CHN-CAN', nom: 'Canton', codePays: 'CHN' },
  { code: 'CHN-SZX', nom: 'Shenzhen', codePays: 'CHN' },
  { code: 'CHN-HGH', nom: 'Hangzhou', codePays: 'CHN' },
  { code: 'CHN-CTU', nom: 'Chengdu', codePays: 'CHN' },
  { code: 'CHN-WUH', nom: 'Wuhan', codePays: 'CHN' },
  { code: 'CHN-XIY', nom: 'Xi\'an', codePays: 'CHN' },
  { code: 'CHN-CKG', nom: 'Chongqing', codePays: 'CHN' },
  { code: 'CHN-TSN', nom: 'Tianjin', codePays: 'CHN' },

  // Chypre (CYP)
  { code: 'CYP-NIC', nom: 'Nicosie', codePays: 'CYP' },
  { code: 'CYP-LIM', nom: 'Limassol', codePays: 'CYP' },
  { code: 'CYP-LCA', nom: 'Larnaca', codePays: 'CYP' },

  // Colombie (COL)
  { code: 'COL-BOG', nom: 'Bogotá', codePays: 'COL' },
  { code: 'COL-MDE', nom: 'Medellín', codePays: 'COL' },
  { code: 'COL-CLO', nom: 'Cali', codePays: 'COL' },
  { code: 'COL-BAQ', nom: 'Barranquilla', codePays: 'COL' },
  { code: 'COL-CTG', nom: 'Carthagène', codePays: 'COL' },
  { code: 'COL-BUC', nom: 'Bucaramanga', codePays: 'COL' },

  // Comores (COM)
  { code: 'COM-MOR', nom: 'Moroni', codePays: 'COM' },
  { code: 'COM-MUT', nom: 'Mutsamudu', codePays: 'COM' },

  // Congo (COG)
  { code: 'COG-BZV', nom: 'Brazzaville', codePays: 'COG' },
  { code: 'COG-PNR', nom: 'Pointe-Noire', codePays: 'COG' },
  { code: 'COG-DJM', nom: 'Dolisie', codePays: 'COG' },

  // Corée du Nord (PRK)
  { code: 'PRK-FNJ', nom: 'Pyongyang', codePays: 'PRK' },
  { code: 'PRK-WOS', nom: 'Wonsan', codePays: 'PRK' },
  { code: 'PRK-HAM', nom: 'Hamhung', codePays: 'PRK' },

  // Corée du Sud (KOR)
  { code: 'KOR-SEL', nom: 'Séoul', codePays: 'KOR' },
  { code: 'KOR-PUS', nom: 'Busan', codePays: 'KOR' },
  { code: 'KOR-ICN', nom: 'Incheon', codePays: 'KOR' },
  { code: 'KOR-TAE', nom: 'Daegu', codePays: 'KOR' },
  { code: 'KOR-DAE', nom: 'Daejeon', codePays: 'KOR' },
  { code: 'KOR-GWA', nom: 'Gwangju', codePays: 'KOR' },

  // Costa Rica (CRI)
  { code: 'CRI-SJO', nom: 'San José', codePays: 'CRI' },
  { code: 'CRI-LIM', nom: 'Limón', codePays: 'CRI' },
  { code: 'CRI-ALJ', nom: 'Alajuela', codePays: 'CRI' },

  // Côte d'Ivoire (CIV)
  { code: 'CIV-ABJ', nom: 'Abidjan', codePays: 'CIV' },
  { code: 'CIV-YAM', nom: 'Yamoussoukro', codePays: 'CIV' },
  { code: 'CIV-BYK', nom: 'Bouaké', codePays: 'CIV' },
  { code: 'CIV-DAL', nom: 'Daloa', codePays: 'CIV' },
  { code: 'CIV-SAN', nom: 'San-Pédro', codePays: 'CIV' },
  { code: 'CIV-KOR', nom: 'Korhogo', codePays: 'CIV' },
  { code: 'CIV-MAN', nom: 'Man', codePays: 'CIV' },
  { code: 'CIV-GGN', nom: 'Gagnoa', codePays: 'CIV' },
  { code: 'CIV-DIV', nom: 'Divo', codePays: 'CIV' },
  { code: 'CIV-ABG', nom: 'Abengourou', codePays: 'CIV' },
  { code: 'CIV-AGN', nom: 'Agboville', codePays: 'CIV' },
  { code: 'CIV-GRA', nom: 'Grand-Bassam', codePays: 'CIV' },
  { code: 'CIV-ODI', nom: 'Odienné', codePays: 'CIV' },
  { code: 'CIV-BOU', nom: 'Boundiali', codePays: 'CIV' },
  { code: 'CIV-ABI', nom: 'Aboisso', codePays: 'CIV' },
  { code: 'CIV-SAS', nom: 'Sassandra', codePays: 'CIV' },
  { code: 'CIV-BON', nom: 'Bondoukou', codePays: 'CIV' },
  { code: 'CIV-TIA', nom: 'Tiassalé', codePays: 'CIV' },

  // Croatie (HRV)
  { code: 'HRV-ZAG', nom: 'Zagreb', codePays: 'HRV' },
  { code: 'HRV-SPU', nom: 'Split', codePays: 'HRV' },
  { code: 'HRV-RJK', nom: 'Rijeka', codePays: 'HRV' },
  { code: 'HRV-OSI', nom: 'Osijek', codePays: 'HRV' },
  { code: 'HRV-ZAD', nom: 'Zadar', codePays: 'HRV' },

  // Cuba (CUB)
  { code: 'CUB-HAV', nom: 'La Havane', codePays: 'CUB' },
  { code: 'CUB-SCU', nom: 'Santiago de Cuba', codePays: 'CUB' },
  { code: 'CUB-CMW', nom: 'Camagüey', codePays: 'CUB' },
  { code: 'CUB-HOL', nom: 'Holguín', codePays: 'CUB' },

  // Danemark (DNK)
  { code: 'DNK-CPH', nom: 'Copenhague', codePays: 'DNK' },
  { code: 'DNK-AAL', nom: 'Aarhus', codePays: 'DNK' },
  { code: 'DNK-ODE', nom: 'Odense', codePays: 'DNK' },
  { code: 'DNK-AAB', nom: 'Aalborg', codePays: 'DNK' },
  { code: 'DNK-ESB', nom: 'Esbjerg', codePays: 'DNK' },

  // Djibouti (DJI)
  { code: 'DJI-JIB', nom: 'Djibouti', codePays: 'DJI' },
  { code: 'DJI-ALI', nom: 'Ali Sabieh', codePays: 'DJI' },
  { code: 'DJI-TAD', nom: 'Tadjourah', codePays: 'DJI' },

  // Dominique (DMA)
  { code: 'DMA-DOM', nom: 'Roseau', codePays: 'DMA' },

  // Égypte (EGY)
  { code: 'EGY-CAI', nom: 'Le Caire', codePays: 'EGY' },
  { code: 'EGY-ALY', nom: 'Alexandrie', codePays: 'EGY' },
  { code: 'EGY-GIZ', nom: 'Gizeh', codePays: 'EGY' },
  { code: 'EGY-LXR', nom: 'Louxor', codePays: 'EGY' },
  { code: 'EGY-ASW', nom: 'Assouan', codePays: 'EGY' },
  { code: 'EGY-PSD', nom: 'Port-Saïd', codePays: 'EGY' },
  { code: 'EGY-SUZ', nom: 'Suez', codePays: 'EGY' },

  // Émirats arabes unis (ARE)
  { code: 'ARE-DXB', nom: 'Dubaï', codePays: 'ARE' },
  { code: 'ARE-AUH', nom: 'Abou Dabi', codePays: 'ARE' },
  { code: 'ARE-SHJ', nom: 'Sharjah', codePays: 'ARE' },
  { code: 'ARE-AJM', nom: 'Ajman', codePays: 'ARE' },
  { code: 'ARE-RAK', nom: 'Ras el Khaïmah', codePays: 'ARE' },

  // Équateur (ECU)
  { code: 'ECU-UIO', nom: 'Quito', codePays: 'ECU' },
  { code: 'ECU-GYE', nom: 'Guayaquil', codePays: 'ECU' },
  { code: 'ECU-CUE', nom: 'Cuenca', codePays: 'ECU' },
  { code: 'ECU-MEC', nom: 'Manta', codePays: 'ECU' },

  // Érythrée (ERI)
  { code: 'ERI-ASM', nom: 'Asmara', codePays: 'ERI' },
  { code: 'ERI-MSW', nom: 'Massaoua', codePays: 'ERI' },
  { code: 'ERI-ASA', nom: 'Assab', codePays: 'ERI' },

  // Espagne (ESP)
  { code: 'ESP-MAD', nom: 'Madrid', codePays: 'ESP' },
  { code: 'ESP-BCN', nom: 'Barcelone', codePays: 'ESP' },
  { code: 'ESP-VLC', nom: 'Valence', codePays: 'ESP' },
  { code: 'ESP-SVQ', nom: 'Séville', codePays: 'ESP' },
  { code: 'ESP-ZAZ', nom: 'Saragosse', codePays: 'ESP' },
  { code: 'ESP-MAL', nom: 'Málaga', codePays: 'ESP' },
  { code: 'ESP-MUR', nom: 'Murcie', codePays: 'ESP' },
  { code: 'ESP-PAL', nom: 'Palma de Majorque', codePays: 'ESP' },
  { code: 'ESP-BIL', nom: 'Bilbao', codePays: 'ESP' },
  { code: 'ESP-ALC', nom: 'Alicante', codePays: 'ESP' },

  // Estonie (EST)
  { code: 'EST-TLL', nom: 'Tallinn', codePays: 'EST' },
  { code: 'EST-TRT', nom: 'Tartu', codePays: 'EST' },
  { code: 'EST-NAR', nom: 'Narva', codePays: 'EST' },

  // Eswatini (SWZ)
  { code: 'SWZ-MTS', nom: 'Mbabane', codePays: 'SWZ' },
  { code: 'SWZ-MAN', nom: 'Manzini', codePays: 'SWZ' },

  // États-Unis (USA)
  { code: 'USA-WAS', nom: 'Washington', codePays: 'USA' },
  { code: 'USA-NYC', nom: 'New York', codePays: 'USA' },
  { code: 'USA-LAX', nom: 'Los Angeles', codePays: 'USA' },
  { code: 'USA-CHI', nom: 'Chicago', codePays: 'USA' },
  { code: 'USA-HOU', nom: 'Houston', codePays: 'USA' },
  { code: 'USA-PHX', nom: 'Phoenix', codePays: 'USA' },
  { code: 'USA-PHI', nom: 'Philadelphie', codePays: 'USA' },
  { code: 'USA-SAN', nom: 'San Antonio', codePays: 'USA' },
  { code: 'USA-SDG', nom: 'San Diego', codePays: 'USA' },
  { code: 'USA-DAL', nom: 'Dallas', codePays: 'USA' },
  { code: 'USA-SJC', nom: 'San José', codePays: 'USA' },
  { code: 'USA-AUS', nom: 'Austin', codePays: 'USA' },
  { code: 'USA-JAX', nom: 'Jacksonville', codePays: 'USA' },
  { code: 'USA-SFO', nom: 'San Francisco', codePays: 'USA' },
  { code: 'USA-MIA', nom: 'Miami', codePays: 'USA' },

  // Éthiopie (ETH)
  { code: 'ETH-ADD', nom: 'Addis-Abeba', codePays: 'ETH' },
  { code: 'ETH-DIR', nom: 'Dire Dawa', codePays: 'ETH' },
  { code: 'ETH-GON', nom: 'Gondar', codePays: 'ETH' },
  { code: 'ETH-MEK', nom: 'Mek\'ele', codePays: 'ETH' },

  // Fidji (FJI)
  { code: 'FJI-SUV', nom: 'Suva', codePays: 'FJI' },
  { code: 'FJI-LAU', nom: 'Lautoka', codePays: 'FJI' },

  // Finlande (FIN)
  { code: 'FIN-HEL', nom: 'Helsinki', codePays: 'FIN' },
  { code: 'FIN-ESP', nom: 'Espoo', codePays: 'FIN' },
  { code: 'FIN-TMP', nom: 'Tampere', codePays: 'FIN' },
  { code: 'FIN-VAN', nom: 'Vantaa', codePays: 'FIN' },
  { code: 'FIN-OUL', nom: 'Oulu', codePays: 'FIN' },

  // France (FRA)
  { code: 'FRA-PAR', nom: 'Paris', codePays: 'FRA' },
  { code: 'FRA-MRS', nom: 'Marseille', codePays: 'FRA' },
  { code: 'FRA-LYS', nom: 'Lyon', codePays: 'FRA' },
  { code: 'FRA-TLS', nom: 'Toulouse', codePays: 'FRA' },
  { code: 'FRA-NCE', nom: 'Nice', codePays: 'FRA' },
  { code: 'FRA-NTE', nom: 'Nantes', codePays: 'FRA' },
  { code: 'FRA-STR', nom: 'Strasbourg', codePays: 'FRA' },
  { code: 'FRA-MPL', nom: 'Montpellier', codePays: 'FRA' },
  { code: 'FRA-BDX', nom: 'Bordeaux', codePays: 'FRA' },
  { code: 'FRA-LIL', nom: 'Lille', codePays: 'FRA' },
  { code: 'FRA-RNS', nom: 'Rennes', codePays: 'FRA' },
  { code: 'FRA-RMS', nom: 'Reims', codePays: 'FRA' },
  { code: 'FRA-HAC', nom: 'Le Havre', codePays: 'FRA' },
  { code: 'FRA-STE', nom: 'Saint-Étienne', codePays: 'FRA' },
  { code: 'FRA-TLN', nom: 'Toulon', codePays: 'FRA' },
  { code: 'FRA-GNB', nom: 'Grenoble', codePays: 'FRA' },
  { code: 'FRA-DIJ', nom: 'Dijon', codePays: 'FRA' },
  { code: 'FRA-ANG', nom: 'Angers', codePays: 'FRA' },
  { code: 'FRA-NIM', nom: 'Nîmes', codePays: 'FRA' },
  { code: 'FRA-VLC', nom: 'Villeurbanne', codePays: 'FRA' },
  { code: 'FRA-LMN', nom: 'Le Mans', codePays: 'FRA' },
  { code: 'FRA-AIX', nom: 'Aix-en-Provence', codePays: 'FRA' },
  { code: 'FRA-BRS', nom: 'Brest', codePays: 'FRA' },
  { code: 'FRA-TRS', nom: 'Tours', codePays: 'FRA' },
  { code: 'FRA-AMN', nom: 'Amiens', codePays: 'FRA' },
  { code: 'FRA-LIM', nom: 'Limoges', codePays: 'FRA' },
  { code: 'FRA-ANE', nom: 'Annecy', codePays: 'FRA' },
  { code: 'FRA-PRP', nom: 'Perpignan', codePays: 'FRA' },
  { code: 'FRA-BZN', nom: 'Besançon', codePays: 'FRA' },
  { code: 'FRA-ORL', nom: 'Orléans', codePays: 'FRA' },

  // Gabon (GAB)
  { code: 'GAB-LBV', nom: 'Libreville', codePays: 'GAB' },
  { code: 'GAB-POG', nom: 'Port-Gentil', codePays: 'GAB' },
  { code: 'GAB-FRA', nom: 'Franceville', codePays: 'GAB' },
  { code: 'GAB-OYE', nom: 'Oyem', codePays: 'GAB' },

  // Gambie (GMB)
  { code: 'GMB-BJL', nom: 'Banjul', codePays: 'GMB' },
  { code: 'GMB-SER', nom: 'Serekunda', codePays: 'GMB' },
  { code: 'GMB-BRI', nom: 'Brikama', codePays: 'GMB' },

  // Géorgie (GEO)
  { code: 'GEO-TBS', nom: 'Tbilissi', codePays: 'GEO' },
  { code: 'GEO-KUT', nom: 'Koutaïssi', codePays: 'GEO' },
  { code: 'GEO-BAT', nom: 'Batoumi', codePays: 'GEO' },

  // Ghana (GHA)
  { code: 'GHA-ACC', nom: 'Accra', codePays: 'GHA' },
  { code: 'GHA-KMS', nom: 'Kumasi', codePays: 'GHA' },
  { code: 'GHA-TML', nom: 'Tamale', codePays: 'GHA' },
  { code: 'GHA-TKD', nom: 'Takoradi', codePays: 'GHA' },

  // Grèce (GRC)
  { code: 'GRC-ATH', nom: 'Athènes', codePays: 'GRC' },
  { code: 'GRC-SKG', nom: 'Thessalonique', codePays: 'GRC' },
  { code: 'GRC-PAT', nom: 'Patras', codePays: 'GRC' },
  { code: 'GRC-HER', nom: 'Héraklion', codePays: 'GRC' },
  { code: 'GRC-LAR', nom: 'Larissa', codePays: 'GRC' },

  // Grenade (GRD)
  { code: 'GRD-STG', nom: 'Saint-Georges', codePays: 'GRD' },

  // Guatemala (GTM)
  { code: 'GTM-GUA', nom: 'Guatemala', codePays: 'GTM' },
  { code: 'GTM-QUE', nom: 'Quetzaltenango', codePays: 'GTM' },
  { code: 'GTM-ESC', nom: 'Escuintla', codePays: 'GTM' },

  // Guinée (GIN)
  { code: 'GIN-CKY', nom: 'Conakry', codePays: 'GIN' },
  { code: 'GIN-BFA', nom: 'Boffa', codePays: 'GIN' },
  { code: 'GIN-BKE', nom: 'Boké', codePays: 'GIN' },
  { code: 'GIN-FRI', nom: 'Fria', codePays: 'GIN' },
  { code: 'GIN-GAL', nom: 'Gaoual', codePays: 'GIN' },
  { code: 'GIN-KDR', nom: 'Koundara', codePays: 'GIN' },
  { code: 'GIN-DBL', nom: 'Dabola', codePays: 'GIN' },
  { code: 'GIN-DGR', nom: 'Dinguiraye', codePays: 'GIN' },
  { code: 'GIN-FRN', nom: 'Faranah', codePays: 'GIN' },
  { code: 'GIN-KDG', nom: 'Kissidougou', codePays: 'GIN' },
  { code: 'GIN-KKA', nom: 'Kankan', codePays: 'GIN' },
  { code: 'GIN-KRN', nom: 'Kérouané', codePays: 'GIN' },
  { code: 'GIN-KRS', nom: 'Kouroussa', codePays: 'GIN' },
  { code: 'GIN-MDN', nom: 'Mandiana', codePays: 'GIN' },
  { code: 'GIN-SGR', nom: 'Siguiri', codePays: 'GIN' },
  { code: 'GIN-CYA', nom: 'Coyah', codePays: 'GIN' },
  { code: 'GIN-DBK', nom: 'Dubréka', codePays: 'GIN' },
  { code: 'GIN-FRC', nom: 'Forécariah', codePays: 'GIN' },
  { code: 'GIN-KDA', nom: 'Kindia', codePays: 'GIN' },
  { code: 'GIN-TML', nom: 'Télimélé', codePays: 'GIN' },
  { code: 'GIN-KBA', nom: 'Koubia', codePays: 'GIN' },
  { code: 'GIN-LBE', nom: 'Labé', codePays: 'GIN' },
  { code: 'GIN-LLM', nom: 'Lélouma', codePays: 'GIN' },
  { code: 'GIN-MLI', nom: 'Mali', codePays: 'GIN' },
  { code: 'GIN-TGE', nom: 'Tougué', codePays: 'GIN' },
  { code: 'GIN-DLB', nom: 'Dalaba', codePays: 'GIN' },
  { code: 'GIN-MMU', nom: 'Mamou', codePays: 'GIN' },
  { code: 'GIN-PTA', nom: 'Pita', codePays: 'GIN' },
  { code: 'GIN-BLA', nom: 'Beyla', codePays: 'GIN' },
  { code: 'GIN-GKD', nom: 'Guéckédou', codePays: 'GIN' },
  { code: 'GIN-LLA', nom: 'Lola', codePays: 'GIN' },
  { code: 'GIN-MCT', nom: 'Macenta', codePays: 'GIN' },
  { code: 'GIN-ZKR', nom: 'Nzérékoré', codePays: 'GIN' },
  { code: 'GIN-YMU', nom: 'Yomou', codePays: 'GIN' },

  // Guinée équatoriale (GNQ)
  { code: 'GNQ-MAL', nom: 'Malabo', codePays: 'GNQ' },
  { code: 'GNQ-BAT', nom: 'Bata', codePays: 'GNQ' },

  // Guinée-Bissau (GNB)
  { code: 'GNB-BIS', nom: 'Bissau', codePays: 'GNB' },
  { code: 'GNB-BAF', nom: 'Bafatá', codePays: 'GNB' },
  { code: 'GNB-GAB', nom: 'Gabú', codePays: 'GNB' },

  // Guyana (GUY)
  { code: 'GUY-GEO', nom: 'Georgetown', codePays: 'GUY' },
  { code: 'GUY-LIN', nom: 'Linden', codePays: 'GUY' },

  // Haïti (HTI)
  { code: 'HTI-PAP', nom: 'Port-au-Prince', codePays: 'HTI' },
  { code: 'HTI-CAP', nom: 'Cap-Haïtien', codePays: 'HTI' },
  { code: 'HTI-CAR', nom: 'Carrefour', codePays: 'HTI' },
  { code: 'HTI-GON', nom: 'Gonaïves', codePays: 'HTI' },

  // Honduras (HND)
  { code: 'HND-TEG', nom: 'Tegucigalpa', codePays: 'HND' },
  { code: 'HND-SAP', nom: 'San Pedro Sula', codePays: 'HND' },
  { code: 'HND-CHO', nom: 'Choloma', codePays: 'HND' },

  // Hongrie (HUN)
  { code: 'HUN-BUD', nom: 'Budapest', codePays: 'HUN' },
  { code: 'HUN-DEB', nom: 'Debrecen', codePays: 'HUN' },
  { code: 'HUN-SZE', nom: 'Szeged', codePays: 'HUN' },
  { code: 'HUN-MIS', nom: 'Miskolc', codePays: 'HUN' },

  // Îles Marshall (MHL)
  { code: 'MHL-MAJ', nom: 'Majuro', codePays: 'MHL' },

  // Îles Salomon (SLB)
  { code: 'SLB-HIR', nom: 'Honiara', codePays: 'SLB' },

  // Inde (IND)
  { code: 'IND-DEL', nom: 'New Delhi', codePays: 'IND' },
  { code: 'IND-BOM', nom: 'Mumbai', codePays: 'IND' },
  { code: 'IND-BLR', nom: 'Bangalore', codePays: 'IND' },
  { code: 'IND-MAA', nom: 'Chennai', codePays: 'IND' },
  { code: 'IND-CCU', nom: 'Kolkata', codePays: 'IND' },
  { code: 'IND-HYD', nom: 'Hyderabad', codePays: 'IND' },
  { code: 'IND-AMD', nom: 'Ahmedabad', codePays: 'IND' },
  { code: 'IND-PUN', nom: 'Pune', codePays: 'IND' },
  { code: 'IND-SUR', nom: 'Surat', codePays: 'IND' },
  { code: 'IND-JAI', nom: 'Jaipur', codePays: 'IND' },

  // Indonésie (IDN)
  { code: 'IDN-JKT', nom: 'Jakarta', codePays: 'IDN' },
  { code: 'IDN-SUB', nom: 'Surabaya', codePays: 'IDN' },
  { code: 'IDN-BDO', nom: 'Bandung', codePays: 'IDN' },
  { code: 'IDN-MDN', nom: 'Medan', codePays: 'IDN' },
  { code: 'IDN-SMG', nom: 'Semarang', codePays: 'IDN' },
  { code: 'IDN-MAK', nom: 'Makassar', codePays: 'IDN' },

  // Irak (IRQ)
  { code: 'IRQ-BGW', nom: 'Bagdad', codePays: 'IRQ' },
  { code: 'IRQ-BSR', nom: 'Bassorah', codePays: 'IRQ' },
  { code: 'IRQ-MOS', nom: 'Mossoul', codePays: 'IRQ' },
  { code: 'IRQ-EBL', nom: 'Erbil', codePays: 'IRQ' },
  { code: 'IRQ-NJF', nom: 'Nadjaf', codePays: 'IRQ' },

  // Iran (IRN)
  { code: 'IRN-THR', nom: 'Téhéran', codePays: 'IRN' },
  { code: 'IRN-MHD', nom: 'Mashhad', codePays: 'IRN' },
  { code: 'IRN-IFN', nom: 'Ispahan', codePays: 'IRN' },
  { code: 'IRN-TBZ', nom: 'Tabriz', codePays: 'IRN' },
  { code: 'IRN-KER', nom: 'Kerman', codePays: 'IRN' },
  { code: 'IRN-SHI', nom: 'Chiraz', codePays: 'IRN' },

  // Irlande (IRL)
  { code: 'IRL-DUB', nom: 'Dublin', codePays: 'IRL' },
  { code: 'IRL-ORK', nom: 'Cork', codePays: 'IRL' },
  { code: 'IRL-GWY', nom: 'Galway', codePays: 'IRL' },
  { code: 'IRL-LIM', nom: 'Limerick', codePays: 'IRL' },
  { code: 'IRL-WAT', nom: 'Waterford', codePays: 'IRL' },

  // Islande (ISL)
  { code: 'ISL-REK', nom: 'Reykjavik', codePays: 'ISL' },
  { code: 'ISL-KOP', nom: 'Kópavogur', codePays: 'ISL' },
  { code: 'ISL-HAF', nom: 'Hafnarfjörður', codePays: 'ISL' },

  // Israël (ISR)
  { code: 'ISR-JRS', nom: 'Jérusalem', codePays: 'ISR' },
  { code: 'ISR-TLV', nom: 'Tel Aviv', codePays: 'ISR' },
  { code: 'ISR-HFA', nom: 'Haïfa', codePays: 'ISR' },
  { code: 'ISR-RIS', nom: 'Rishon LeZion', codePays: 'ISR' },
  { code: 'ISR-ASH', nom: 'Ashdod', codePays: 'ISR' },

  // Italie (ITA)
  { code: 'ITA-ROM', nom: 'Rome', codePays: 'ITA' },
  { code: 'ITA-MIL', nom: 'Milan', codePays: 'ITA' },
  { code: 'ITA-NAP', nom: 'Naples', codePays: 'ITA' },
  { code: 'ITA-TRN', nom: 'Turin', codePays: 'ITA' },
  { code: 'ITA-FLR', nom: 'Florence', codePays: 'ITA' },
  { code: 'ITA-PAL', nom: 'Palerme', codePays: 'ITA' },
  { code: 'ITA-BOL', nom: 'Bologne', codePays: 'ITA' },
  { code: 'ITA-GEN', nom: 'Gênes', codePays: 'ITA' },
  { code: 'ITA-VEN', nom: 'Venise', codePays: 'ITA' },
  { code: 'ITA-VER', nom: 'Vérone', codePays: 'ITA' },

  // Jamaïque (JAM)
  { code: 'JAM-KIN', nom: 'Kingston', codePays: 'JAM' },
  { code: 'JAM-MBJ', nom: 'Montego Bay', codePays: 'JAM' },
  { code: 'JAM-SPA', nom: 'Spanish Town', codePays: 'JAM' },

  // Japon (JPN)
  { code: 'JPN-TYO', nom: 'Tokyo', codePays: 'JPN' },
  { code: 'JPN-OSA', nom: 'Osaka', codePays: 'JPN' },
  { code: 'JPN-NGO', nom: 'Nagoya', codePays: 'JPN' },
  { code: 'JPN-SPK', nom: 'Sapporo', codePays: 'JPN' },
  { code: 'JPN-FUK', nom: 'Fukuoka', codePays: 'JPN' },
  { code: 'JPN-KYO', nom: 'Kyoto', codePays: 'JPN' },
  { code: 'JPN-KOB', nom: 'Kobe', codePays: 'JPN' },
  { code: 'JPN-YOK', nom: 'Yokohama', codePays: 'JPN' },

  // Jordanie (JOR)
  { code: 'JOR-AMM', nom: 'Amman', codePays: 'JOR' },
  { code: 'JOR-AQJ', nom: 'Aqaba', codePays: 'JOR' },
  { code: 'JOR-IRB', nom: 'Irbid', codePays: 'JOR' },
  { code: 'JOR-ZRQ', nom: 'Zarqa', codePays: 'JOR' },

  // Kazakhstan (KAZ)
  { code: 'KAZ-ALA', nom: 'Almaty', codePays: 'KAZ' },
  { code: 'KAZ-TSE', nom: 'Astana', codePays: 'KAZ' },
  { code: 'KAZ-KAR', nom: 'Karaganda', codePays: 'KAZ' },
  { code: 'KAZ-AKT', nom: 'Aktobe', codePays: 'KAZ' },

  // Kenya (KEN)
  { code: 'KEN-NBO', nom: 'Nairobi', codePays: 'KEN' },
  { code: 'KEN-MBA', nom: 'Mombasa', codePays: 'KEN' },
  { code: 'KEN-KIS', nom: 'Kisumu', codePays: 'KEN' },
  { code: 'KEN-NAK', nom: 'Nakuru', codePays: 'KEN' },
  { code: 'KEN-ELD', nom: 'Eldoret', codePays: 'KEN' },

  // Kirghizistan (KGZ)
  { code: 'KGZ-FRU', nom: 'Bichkek', codePays: 'KGZ' },
  { code: 'KGZ-OSS', nom: 'Osh', codePays: 'KGZ' },
  { code: 'KGZ-JAL', nom: 'Jalal-Abad', codePays: 'KGZ' },

  // Kiribati (KIR)
  { code: 'KIR-TRW', nom: 'Tarawa-Sud', codePays: 'KIR' },

  // Koweït (KWT)
  { code: 'KWT-KWI', nom: 'Koweït', codePays: 'KWT' },
  { code: 'KWT-SAL', nom: 'Salmiya', codePays: 'KWT' },
  { code: 'KWT-HAW', nom: 'Hawalli', codePays: 'KWT' },

  // Laos (LAO)
  { code: 'LAO-VTE', nom: 'Vientiane', codePays: 'LAO' },
  { code: 'LAO-LPQ', nom: 'Luang Prabang', codePays: 'LAO' },
  { code: 'LAO-PKZ', nom: 'Paksé', codePays: 'LAO' },

  // Lesotho (LSO)
  { code: 'LSO-MSU', nom: 'Maseru', codePays: 'LSO' },
  { code: 'LSO-TEY', nom: 'Teyateyaneng', codePays: 'LSO' },

  // Lettonie (LVA)
  { code: 'LVA-RIX', nom: 'Riga', codePays: 'LVA' },
  { code: 'LVA-DGV', nom: 'Daugavpils', codePays: 'LVA' },
  { code: 'LVA-LPX', nom: 'Liepāja', codePays: 'LVA' },

  // Liban (LBN)
  { code: 'LBN-BEY', nom: 'Beyrouth', codePays: 'LBN' },
  { code: 'LBN-TRI', nom: 'Tripoli', codePays: 'LBN' },
  { code: 'LBN-SID', nom: 'Sidon', codePays: 'LBN' },
  { code: 'LBN-TYR', nom: 'Tyr', codePays: 'LBN' },

  // Libéria (LBR)
  { code: 'LBR-ROB', nom: 'Monrovia', codePays: 'LBR' },
  { code: 'LBR-GAN', nom: 'Ganta', codePays: 'LBR' },
  { code: 'LBR-BUC', nom: 'Buchanan', codePays: 'LBR' },

  // Libye (LBY)
  { code: 'LBY-TIP', nom: 'Tripoli', codePays: 'LBY' },
  { code: 'LBY-BEN', nom: 'Benghazi', codePays: 'LBY' },
  { code: 'LBY-MIS', nom: 'Misrata', codePays: 'LBY' },

  // Liechtenstein (LIE)
  { code: 'LIE-VAD', nom: 'Vaduz', codePays: 'LIE' },

  // Lituanie (LTU)
  { code: 'LTU-VNO', nom: 'Vilnius', codePays: 'LTU' },
  { code: 'LTU-KUN', nom: 'Kaunas', codePays: 'LTU' },
  { code: 'LTU-KLJ', nom: 'Klaipėda', codePays: 'LTU' },

  // Luxembourg (LUX)
  { code: 'LUX-LUX', nom: 'Luxembourg', codePays: 'LUX' },
  { code: 'LUX-ESC', nom: 'Esch-sur-Alzette', codePays: 'LUX' },

  // Macédoine du Nord (MKD)
  { code: 'MKD-SKP', nom: 'Skopje', codePays: 'MKD' },
  { code: 'MKD-BIT', nom: 'Bitola', codePays: 'MKD' },
  { code: 'MKD-KUM', nom: 'Kumanovo', codePays: 'MKD' },

  // Madagascar (MDG)
  { code: 'MDG-TNR', nom: 'Antananarivo', codePays: 'MDG' },
  { code: 'MDG-TMM', nom: 'Toamasina', codePays: 'MDG' },
  { code: 'MDG-ANM', nom: 'Antsirabe', codePays: 'MDG' },
  { code: 'MDG-FTU', nom: 'Fianarantsoa', codePays: 'MDG' },

  // Malaisie (MYS)
  { code: 'MYS-KUL', nom: 'Kuala Lumpur', codePays: 'MYS' },
  { code: 'MYS-JHB', nom: 'Johor Bahru', codePays: 'MYS' },
  { code: 'MYS-PEN', nom: 'George Town', codePays: 'MYS' },
  { code: 'MYS-IPH', nom: 'Ipoh', codePays: 'MYS' },
  { code: 'MYS-KCH', nom: 'Kuching', codePays: 'MYS' },

  // Malawi (MWI)
  { code: 'MWI-LLW', nom: 'Lilongwe', codePays: 'MWI' },
  { code: 'MWI-BLZ', nom: 'Blantyre', codePays: 'MWI' },
  { code: 'MWI-MZU', nom: 'Mzuzu', codePays: 'MWI' },

  // Maldives (MDV)
  { code: 'MDV-MLE', nom: 'Malé', codePays: 'MDV' },

  // Mali (MLI)
  { code: 'MLI-BKO', nom: 'Bamako', codePays: 'MLI' },
  { code: 'MLI-SIK', nom: 'Sikasso', codePays: 'MLI' },
  { code: 'MLI-MOP', nom: 'Mopti', codePays: 'MLI' },
  { code: 'MLI-KYS', nom: 'Kayes', codePays: 'MLI' },
  { code: 'MLI-SEG', nom: 'Ségou', codePays: 'MLI' },
  { code: 'MLI-GAO', nom: 'Gao', codePays: 'MLI' },
  { code: 'MLI-TOM', nom: 'Tombouctou', codePays: 'MLI' },
  { code: 'MLI-KTI', nom: 'Kati', codePays: 'MLI' },
  { code: 'MLI-KOU', nom: 'Koutiala', codePays: 'MLI' },
  { code: 'MLI-KDL', nom: 'Kidal', codePays: 'MLI' },
  { code: 'MLI-SAN', nom: 'San', codePays: 'MLI' },
  { code: 'MLI-BLA', nom: 'Bla', codePays: 'MLI' },
  { code: 'MLI-DJE', nom: 'Djenné', codePays: 'MLI' },
  { code: 'MLI-KOL', nom: 'Kolokani', codePays: 'MLI' },
  { code: 'MLI-YEL', nom: 'Yélimané', codePays: 'MLI' },

  // Malte (MLT)
  { code: 'MLT-VLT', nom: 'La Valette', codePays: 'MLT' },
  { code: 'MLT-BIR', nom: 'Birkirkara', codePays: 'MLT' },
  { code: 'MLT-MOT', nom: 'Mosta', codePays: 'MLT' },

  // Maroc (MAR)
  { code: 'MAR-RBA', nom: 'Rabat', codePays: 'MAR' },
  { code: 'MAR-CMN', nom: 'Casablanca', codePays: 'MAR' },
  { code: 'MAR-FEZ', nom: 'Fès', codePays: 'MAR' },
  { code: 'MAR-RAK', nom: 'Marrakech', codePays: 'MAR' },
  { code: 'MAR-TNG', nom: 'Tanger', codePays: 'MAR' },
  { code: 'MAR-AGD', nom: 'Agadir', codePays: 'MAR' },
  { code: 'MAR-MKN', nom: 'Meknès', codePays: 'MAR' },
  { code: 'MAR-OUD', nom: 'Oujda', codePays: 'MAR' },

  // Maurice (MUS)
  { code: 'MUS-PLU', nom: 'Port-Louis', codePays: 'MUS' },
  { code: 'MUS-VAC', nom: 'Vacoas-Phoenix', codePays: 'MUS' },

  // Mauritanie (MRT)
  { code: 'MRT-NKC', nom: 'Nouakchott', codePays: 'MRT' },
  { code: 'MRT-NDB', nom: 'Nouadhibou', codePays: 'MRT' },
  { code: 'MRT-NEM', nom: 'Néma', codePays: 'MRT' },
  { code: 'MRT-KED', nom: 'Kaédi', codePays: 'MRT' },

  // Mexique (MEX)
  { code: 'MEX-MEX', nom: 'Mexico', codePays: 'MEX' },
  { code: 'MEX-GDL', nom: 'Guadalajara', codePays: 'MEX' },
  { code: 'MEX-MTY', nom: 'Monterrey', codePays: 'MEX' },
  { code: 'MEX-PBC', nom: 'Puebla', codePays: 'MEX' },
  { code: 'MEX-TIJ', nom: 'Tijuana', codePays: 'MEX' },
  { code: 'MEX-LEO', nom: 'León', codePays: 'MEX' },
  { code: 'MEX-CJS', nom: 'Ciudad Juárez', codePays: 'MEX' },

  // Micronésie (FSM)
  { code: 'FSM-PNI', nom: 'Palikir', codePays: 'FSM' },

  // Moldavie (MDA)
  { code: 'MDA-KIV', nom: 'Chișinău', codePays: 'MDA' },
  { code: 'MDA-TIR', nom: 'Tiraspol', codePays: 'MDA' },
  { code: 'MDA-BLT', nom: 'Bălți', codePays: 'MDA' },

  // Monaco (MCO)
  { code: 'MCO-MCM', nom: 'Monaco', codePays: 'MCO' },

  // Mongolie (MNG)
  { code: 'MNG-ULN', nom: 'Oulan-Bator', codePays: 'MNG' },
  { code: 'MNG-ERD', nom: 'Erdenet', codePays: 'MNG' },
  { code: 'MNG-DAR', nom: 'Darkhan', codePays: 'MNG' },

  // Monténégro (MNE)
  { code: 'MNE-TGD', nom: 'Podgorica', codePays: 'MNE' },
  { code: 'MNE-NIK', nom: 'Nikšić', codePays: 'MNE' },

  // Mozambique (MOZ)
  { code: 'MOZ-MPM', nom: 'Maputo', codePays: 'MOZ' },
  { code: 'MOZ-BEW', nom: 'Beira', codePays: 'MOZ' },
  { code: 'MOZ-NAM', nom: 'Nampula', codePays: 'MOZ' },
  { code: 'MOZ-MTS', nom: 'Matola', codePays: 'MOZ' },

  // Myanmar (MMR)
  { code: 'MMR-RGN', nom: 'Rangoun', codePays: 'MMR' },
  { code: 'MMR-MDY', nom: 'Mandalay', codePays: 'MMR' },
  { code: 'MMR-NAY', nom: 'Naypyidaw', codePays: 'MMR' },

  // Namibie (NAM)
  { code: 'NAM-WDH', nom: 'Windhoek', codePays: 'NAM' },
  { code: 'NAM-WVB', nom: 'Walvis Bay', codePays: 'NAM' },
  { code: 'NAM-SWP', nom: 'Swakopmund', codePays: 'NAM' },

  // Nauru (NRU)
  { code: 'NRU-YRE', nom: 'Yaren', codePays: 'NRU' },

  // Népal (NPL)
  { code: 'NPL-KTM', nom: 'Katmandou', codePays: 'NPL' },
  { code: 'NPL-PKR', nom: 'Pokhara', codePays: 'NPL' },
  { code: 'NPL-BIR', nom: 'Biratnagar', codePays: 'NPL' },
  { code: 'NPL-LAL', nom: 'Lalitpur', codePays: 'NPL' },

  // Nicaragua (NIC)
  { code: 'NIC-MGA', nom: 'Managua', codePays: 'NIC' },
  { code: 'NIC-LEO', nom: 'León', codePays: 'NIC' },
  { code: 'NIC-MAS', nom: 'Masaya', codePays: 'NIC' },

  // Niger (NER)
  { code: 'NER-NIM', nom: 'Niamey', codePays: 'NER' },
  { code: 'NER-ZND', nom: 'Zinder', codePays: 'NER' },
  { code: 'NER-MRD', nom: 'Maradi', codePays: 'NER' },
  { code: 'NER-AGA', nom: 'Agadez', codePays: 'NER' },

  // Nigéria (NGA)
  { code: 'NGA-ABV', nom: 'Abuja', codePays: 'NGA' },
  { code: 'NGA-LOS', nom: 'Lagos', codePays: 'NGA' },
  { code: 'NGA-KAN', nom: 'Kano', codePays: 'NGA' },
  { code: 'NGA-IBA', nom: 'Ibadan', codePays: 'NGA' },
  { code: 'NGA-PHC', nom: 'Port Harcourt', codePays: 'NGA' },
  { code: 'NGA-BEN', nom: 'Benin City', codePays: 'NGA' },
  { code: 'NGA-KAD', nom: 'Kaduna', codePays: 'NGA' },

  // Norvège (NOR)
  { code: 'NOR-OSL', nom: 'Oslo', codePays: 'NOR' },
  { code: 'NOR-BGO', nom: 'Bergen', codePays: 'NOR' },
  { code: 'NOR-TRD', nom: 'Trondheim', codePays: 'NOR' },
  { code: 'NOR-SVG', nom: 'Stavanger', codePays: 'NOR' },
  { code: 'NOR-KRS', nom: 'Kristiansand', codePays: 'NOR' },

  // Nouvelle-Zélande (NZL)
  { code: 'NZL-WLG', nom: 'Wellington', codePays: 'NZL' },
  { code: 'NZL-AKL', nom: 'Auckland', codePays: 'NZL' },
  { code: 'NZL-CHC', nom: 'Christchurch', codePays: 'NZL' },
  { code: 'NZL-HLZ', nom: 'Hamilton', codePays: 'NZL' },
  { code: 'NZL-DUD', nom: 'Dunedin', codePays: 'NZL' },

  // Oman (OMN)
  { code: 'OMN-MCT', nom: 'Mascate', codePays: 'OMN' },
  { code: 'OMN-SLL', nom: 'Salalah', codePays: 'OMN' },
  { code: 'OMN-SUR', nom: 'Sohar', codePays: 'OMN' },

  // Ouganda (UGA)
  { code: 'UGA-KLA', nom: 'Kampala', codePays: 'UGA' },
  { code: 'UGA-ENT', nom: 'Entebbe', codePays: 'UGA' },
  { code: 'UGA-GUL', nom: 'Gulu', codePays: 'UGA' },
  { code: 'UGA-LIR', nom: 'Lira', codePays: 'UGA' },

  // Ouzbékistan (UZB)
  { code: 'UZB-TAS', nom: 'Tachkent', codePays: 'UZB' },
  { code: 'UZB-SKD', nom: 'Samarcande', codePays: 'UZB' },
  { code: 'UZB-BUK', nom: 'Boukhara', codePays: 'UZB' },
  { code: 'UZB-AND', nom: 'Andijan', codePays: 'UZB' },

  // Pakistan (PAK)
  { code: 'PAK-ISB', nom: 'Islamabad', codePays: 'PAK' },
  { code: 'PAK-KHI', nom: 'Karachi', codePays: 'PAK' },
  { code: 'PAK-LHE', nom: 'Lahore', codePays: 'PAK' },
  { code: 'PAK-FSD', nom: 'Faisalabad', codePays: 'PAK' },
  { code: 'PAK-RWP', nom: 'Rawalpindi', codePays: 'PAK' },
  { code: 'PAK-MUX', nom: 'Multan', codePays: 'PAK' },

  // Palaos (PLW)
  { code: 'PLW-NGL', nom: 'Ngerulmud', codePays: 'PLW' },

  // Panama (PAN)
  { code: 'PAN-PTY', nom: 'Panama', codePays: 'PAN' },
  { code: 'PAN-DAV', nom: 'David', codePays: 'PAN' },
  { code: 'PAN-COL', nom: 'Colón', codePays: 'PAN' },

  // Papouasie-Nouvelle-Guinée (PNG)
  { code: 'PNG-POM', nom: 'Port Moresby', codePays: 'PNG' },
  { code: 'PNG-LAE', nom: 'Lae', codePays: 'PNG' },

  // Paraguay (PRY)
  { code: 'PRY-ASU', nom: 'Asunción', codePays: 'PRY' },
  { code: 'PRY-CDE', nom: 'Ciudad del Este', codePays: 'PRY' },
  { code: 'PRY-LUQ', nom: 'Luque', codePays: 'PRY' },

  // Pays-Bas (NLD)
  { code: 'NLD-AMS', nom: 'Amsterdam', codePays: 'NLD' },
  { code: 'NLD-RTM', nom: 'Rotterdam', codePays: 'NLD' },
  { code: 'NLD-HAG', nom: 'La Haye', codePays: 'NLD' },
  { code: 'NLD-UTR', nom: 'Utrecht', codePays: 'NLD' },
  { code: 'NLD-EIN', nom: 'Eindhoven', codePays: 'NLD' },
  { code: 'NLD-GRO', nom: 'Groningue', codePays: 'NLD' },

  // Pérou (PER)
  { code: 'PER-LIM', nom: 'Lima', codePays: 'PER' },
  { code: 'PER-AQP', nom: 'Arequipa', codePays: 'PER' },
  { code: 'PER-CUZ', nom: 'Cusco', codePays: 'PER' },
  { code: 'PER-TRU', nom: 'Trujillo', codePays: 'PER' },
  { code: 'PER-CHI', nom: 'Chiclayo', codePays: 'PER' },

  // Philippines (PHL)
  { code: 'PHL-MNL', nom: 'Manille', codePays: 'PHL' },
  { code: 'PHL-CEB', nom: 'Cebu', codePays: 'PHL' },
  { code: 'PHL-DVO', nom: 'Davao', codePays: 'PHL' },
  { code: 'PHL-QZN', nom: 'Quezon City', codePays: 'PHL' },
  { code: 'PHL-CAL', nom: 'Caloocan', codePays: 'PHL' },

  // Pologne (POL)
  { code: 'POL-WAW', nom: 'Varsovie', codePays: 'POL' },
  { code: 'POL-KRK', nom: 'Cracovie', codePays: 'POL' },
  { code: 'POL-WRO', nom: 'Wrocław', codePays: 'POL' },
  { code: 'POL-POZ', nom: 'Poznań', codePays: 'POL' },
  { code: 'POL-GDN', nom: 'Gdańsk', codePays: 'POL' },
  { code: 'POL-SZZ', nom: 'Szczecin', codePays: 'POL' },
  { code: 'POL-LOD', nom: 'Łódź', codePays: 'POL' },

  // Portugal (PRT)
  { code: 'PRT-LIS', nom: 'Lisbonne', codePays: 'PRT' },
  { code: 'PRT-OPO', nom: 'Porto', codePays: 'PRT' },
  { code: 'PRT-FAO', nom: 'Faro', codePays: 'PRT' },
  { code: 'PRT-BRG', nom: 'Braga', codePays: 'PRT' },
  { code: 'PRT-COI', nom: 'Coimbra', codePays: 'PRT' },

  // Qatar (QAT)
  { code: 'QAT-DOH', nom: 'Doha', codePays: 'QAT' },
  { code: 'QAT-RAY', nom: 'Al Rayyan', codePays: 'QAT' },
  { code: 'QAT-WAK', nom: 'Al Wakrah', codePays: 'QAT' },

  // République centrafricaine (CAF)
  { code: 'CAF-BGF', nom: 'Bangui', codePays: 'CAF' },
  { code: 'CAF-BER', nom: 'Bimbo', codePays: 'CAF' },
  { code: 'CAF-BBO', nom: 'Bambari', codePays: 'CAF' },

  // République démocratique du Congo (COD)
  { code: 'COD-FIH', nom: 'Kinshasa', codePays: 'COD' },
  { code: 'COD-FBM', nom: 'Lubumbashi', codePays: 'COD' },
  { code: 'COD-MJM', nom: 'Mbuji-Mayi', codePays: 'COD' },
  { code: 'COD-KAN', nom: 'Kananga', codePays: 'COD' },
  { code: 'COD-KIS', nom: 'Kisangani', codePays: 'COD' },
  { code: 'COD-GOM', nom: 'Goma', codePays: 'COD' },

  // République dominicaine (DOM)
  { code: 'DOM-SDQ', nom: 'Saint-Domingue', codePays: 'DOM' },
  { code: 'DOM-STI', nom: 'Santiago', codePays: 'DOM' },
  { code: 'DOM-HIG', nom: 'La Romana', codePays: 'DOM' },

  // Roumanie (ROU)
  { code: 'ROU-BUH', nom: 'Bucarest', codePays: 'ROU' },
  { code: 'ROU-CLJ', nom: 'Cluj-Napoca', codePays: 'ROU' },
  { code: 'ROU-TSR', nom: 'Timișoara', codePays: 'ROU' },
  { code: 'ROU-IAS', nom: 'Iași', codePays: 'ROU' },
  { code: 'ROU-CRA', nom: 'Craiova', codePays: 'ROU' },

  // Royaume-Uni (GBR)
  { code: 'GBR-LON', nom: 'Londres', codePays: 'GBR' },
  { code: 'GBR-MAN', nom: 'Manchester', codePays: 'GBR' },
  { code: 'GBR-BHM', nom: 'Birmingham', codePays: 'GBR' },
  { code: 'GBR-EDI', nom: 'Édimbourg', codePays: 'GBR' },
  { code: 'GBR-GLA', nom: 'Glasgow', codePays: 'GBR' },
  { code: 'GBR-LIV', nom: 'Liverpool', codePays: 'GBR' },
  { code: 'GBR-BRI', nom: 'Bristol', codePays: 'GBR' },
  { code: 'GBR-SHF', nom: 'Sheffield', codePays: 'GBR' },
  { code: 'GBR-LEE', nom: 'Leeds', codePays: 'GBR' },

  // Russie (RUS)
  { code: 'RUS-MOW', nom: 'Moscou', codePays: 'RUS' },
  { code: 'RUS-LED', nom: 'Saint-Pétersbourg', codePays: 'RUS' },
  { code: 'RUS-NOZ', nom: 'Novossibirsk', codePays: 'RUS' },
  { code: 'RUS-SVX', nom: 'Iekaterinbourg', codePays: 'RUS' },
  { code: 'RUS-KZN', nom: 'Kazan', codePays: 'RUS' },
  { code: 'RUS-NIJ', nom: 'Nijni Novgorod', codePays: 'RUS' },
  { code: 'RUS-CEK', nom: 'Tcheliabinsk', codePays: 'RUS' },
  { code: 'RUS-OMS', nom: 'Omsk', codePays: 'RUS' },
  { code: 'RUS-SAM', nom: 'Samara', codePays: 'RUS' },
  { code: 'RUS-ROS', nom: 'Rostov-sur-le-Don', codePays: 'RUS' },

  // Rwanda (RWA)
  { code: 'RWA-KGL', nom: 'Kigali', codePays: 'RWA' },
  { code: 'RWA-BUT', nom: 'Butare', codePays: 'RWA' },
  { code: 'RWA-GIT', nom: 'Gitarama', codePays: 'RWA' },
  { code: 'RWA-GIS', nom: 'Gisenyi', codePays: 'RWA' },

  // Saint-Kitts-et-Nevis (KNA)
  { code: 'KNA-BAS', nom: 'Basseterre', codePays: 'KNA' },

  // Saint-Marin (SMR)
  { code: 'SMR-SMR', nom: 'Saint-Marin', codePays: 'SMR' },

  // Saint-Vincent-et-les-Grenadines (VCT)
  { code: 'VCT-KTN', nom: 'Kingstown', codePays: 'VCT' },

  // Sainte-Lucie (LCA)
  { code: 'LCA-CAS', nom: 'Castries', codePays: 'LCA' },

  // Salvador (SLV)
  { code: 'SLV-SAL', nom: 'San Salvador', codePays: 'SLV' },
  { code: 'SLV-SSA', nom: 'Santa Ana', codePays: 'SLV' },
  { code: 'SLV-SMA', nom: 'San Miguel', codePays: 'SLV' },

  // Samoa (WSM)
  { code: 'WSM-APW', nom: 'Apia', codePays: 'WSM' },

  // Sao Tomé-et-Principe (STP)
  { code: 'STP-TMS', nom: 'São Tomé', codePays: 'STP' },

  // Sénégal (SEN)
  { code: 'SEN-DKR', nom: 'Dakar', codePays: 'SEN' },
  { code: 'SEN-THS', nom: 'Thiès', codePays: 'SEN' },
  { code: 'SEN-KLC', nom: 'Kaolack', codePays: 'SEN' },
  { code: 'SEN-ZIG', nom: 'Ziguinchor', codePays: 'SEN' },
  { code: 'SEN-SLG', nom: 'Saint-Louis', codePays: 'SEN' },
  { code: 'SEN-TBK', nom: 'Touba', codePays: 'SEN' },
  { code: 'SEN-MBK', nom: 'Mbour', codePays: 'SEN' },
  { code: 'SEN-DIO', nom: 'Diourbel', codePays: 'SEN' },
  { code: 'SEN-LOU', nom: 'Louga', codePays: 'SEN' },
  { code: 'SEN-TAM', nom: 'Tambacounda', codePays: 'SEN' },
  { code: 'SEN-RUF', nom: 'Rufisque', codePays: 'SEN' },
  { code: 'SEN-KDG', nom: 'Kolda', codePays: 'SEN' },
  { code: 'SEN-SEK', nom: 'Sédhiou', codePays: 'SEN' },
  { code: 'SEN-MAT', nom: 'Matam', codePays: 'SEN' },
  { code: 'SEN-KED', nom: 'Kédougou', codePays: 'SEN' },
  { code: 'SEN-FAT', nom: 'Fatick', codePays: 'SEN' },
  { code: 'SEN-GDI', nom: 'Guédiawaye', codePays: 'SEN' },
  { code: 'SEN-PIK', nom: 'Pikine', codePays: 'SEN' },

  // Serbie (SRB)
  { code: 'SRB-BEG', nom: 'Belgrade', codePays: 'SRB' },
  { code: 'SRB-INI', nom: 'Niš', codePays: 'SRB' },
  { code: 'SRB-NSA', nom: 'Novi Sad', codePays: 'SRB' },
  { code: 'SRB-KRA', nom: 'Kragujevac', codePays: 'SRB' },

  // Seychelles (SYC)
  { code: 'SYC-VIC', nom: 'Victoria', codePays: 'SYC' },

  // Sierra Leone (SLE)
  { code: 'SLE-FNA', nom: 'Freetown', codePays: 'SLE' },
  { code: 'SLE-BO', nom: 'Bo', codePays: 'SLE' },
  { code: 'SLE-KEN', nom: 'Kenema', codePays: 'SLE' },
  { code: 'SLE-MAK', nom: 'Makeni', codePays: 'SLE' },
  { code: 'SLE-KOI', nom: 'Koidu', codePays: 'SLE' },
  { code: 'SLE-POR', nom: 'Port Loko', codePays: 'SLE' },
  { code: 'SLE-WAT', nom: 'Waterloo', codePays: 'SLE' },
  { code: 'SLE-KAB', nom: 'Kabala', codePays: 'SLE' },
  { code: 'SLE-KAM', nom: 'Kambia', codePays: 'SLE' },
  { code: 'SLE-PUJ', nom: 'Pujehun', codePays: 'SLE' },
  { code: 'SLE-BON', nom: 'Bonthe', codePays: 'SLE' },
  { code: 'SLE-MAG', nom: 'Magburaka', codePays: 'SLE' },
  { code: 'SLE-LUN', nom: 'Lunsar', codePays: 'SLE' },
  { code: 'SLE-YEN', nom: 'Yengema', codePays: 'SLE' },

  // Singapour (SGP)
  { code: 'SGP-SIN', nom: 'Singapour', codePays: 'SGP' },

  // Slovaquie (SVK)
  { code: 'SVK-BTS', nom: 'Bratislava', codePays: 'SVK' },
  { code: 'SVK-KSC', nom: 'Košice', codePays: 'SVK' },
  { code: 'SVK-PRE', nom: 'Prešov', codePays: 'SVK' },
  { code: 'SVK-ZIL', nom: 'Žilina', codePays: 'SVK' },

  // Slovénie (SVN)
  { code: 'SVN-LJU', nom: 'Ljubljana', codePays: 'SVN' },
  { code: 'SVN-MBX', nom: 'Maribor', codePays: 'SVN' },
  { code: 'SVN-CEL', nom: 'Celje', codePays: 'SVN' },

  // Somalie (SOM)
  { code: 'SOM-MGQ', nom: 'Mogadiscio', codePays: 'SOM' },
  { code: 'SOM-HGA', nom: 'Hargeisa', codePays: 'SOM' },
  { code: 'SOM-BOS', nom: 'Bosaso', codePays: 'SOM' },

  // Soudan (SDN)
  { code: 'SDN-KRT', nom: 'Khartoum', codePays: 'SDN' },
  { code: 'SDN-PZU', nom: 'Port-Soudan', codePays: 'SDN' },
  { code: 'SDN-OMD', nom: 'Omdurman', codePays: 'SDN' },
  { code: 'SDN-NHD', nom: 'Nyala', codePays: 'SDN' },

  // Soudan du Sud (SSD)
  { code: 'SSD-JUB', nom: 'Djouba', codePays: 'SSD' },
  { code: 'SSD-WUU', nom: 'Wau', codePays: 'SSD' },
  { code: 'SSD-MAL', nom: 'Malakal', codePays: 'SSD' },

  // Sri Lanka (LKA)
  { code: 'LKA-CMB', nom: 'Colombo', codePays: 'LKA' },
  { code: 'LKA-SRI', nom: 'Sri Jayewardenepura', codePays: 'LKA' },
  { code: 'LKA-DEH', nom: 'Dehiwala-Mount Lavinia', codePays: 'LKA' },
  { code: 'LKA-KAN', nom: 'Kandy', codePays: 'LKA' },

  // Suède (SWE)
  { code: 'SWE-STO', nom: 'Stockholm', codePays: 'SWE' },
  { code: 'SWE-GOT', nom: 'Göteborg', codePays: 'SWE' },
  { code: 'SWE-MMA', nom: 'Malmö', codePays: 'SWE' },
  { code: 'SWE-UPP', nom: 'Uppsala', codePays: 'SWE' },
  { code: 'SWE-VAS', nom: 'Västerås', codePays: 'SWE' },

  // Suisse (CHE)
  { code: 'CHE-BRN', nom: 'Berne', codePays: 'CHE' },
  { code: 'CHE-ZRH', nom: 'Zurich', codePays: 'CHE' },
  { code: 'CHE-GVA', nom: 'Genève', codePays: 'CHE' },
  { code: 'CHE-BSL', nom: 'Bâle', codePays: 'CHE' },
  { code: 'CHE-LAU', nom: 'Lausanne', codePays: 'CHE' },
  { code: 'CHE-LUG', nom: 'Lugano', codePays: 'CHE' },

  // Suriname (SUR)
  { code: 'SUR-PBM', nom: 'Paramaribo', codePays: 'SUR' },
  { code: 'SUR-LEL', nom: 'Lelydorp', codePays: 'SUR' },

  // Syrie (SYR)
  { code: 'SYR-DAM', nom: 'Damas', codePays: 'SYR' },
  { code: 'SYR-ALP', nom: 'Alep', codePays: 'SYR' },
  { code: 'SYR-HMS', nom: 'Homs', codePays: 'SYR' },
  { code: 'SYR-LAT', nom: 'Lattaquié', codePays: 'SYR' },
  { code: 'SYR-HAM', nom: 'Hama', codePays: 'SYR' },

  // Tadjikistan (TJK)
  { code: 'TJK-DYU', nom: 'Douchanbé', codePays: 'TJK' },
  { code: 'TJK-KQT', nom: 'Khodjent', codePays: 'TJK' },
  { code: 'TJK-KQH', nom: 'Kulob', codePays: 'TJK' },

  // Tanzanie (TZA)
  { code: 'TZA-DAR', nom: 'Dar es Salaam', codePays: 'TZA' },
  { code: 'TZA-DOD', nom: 'Dodoma', codePays: 'TZA' },
  { code: 'TZA-MWZ', nom: 'Mwanza', codePays: 'TZA' },
  { code: 'TZA-ZNZ', nom: 'Zanzibar', codePays: 'TZA' },
  { code: 'TZA-ARK', nom: 'Arusha', codePays: 'TZA' },

  // Tchad (TCD)
  { code: 'TCD-NDJ', nom: 'N\'Djamena', codePays: 'TCD' },
  { code: 'TCD-MQQ', nom: 'Moundou', codePays: 'TCD' },
  { code: 'TCD-AEH', nom: 'Abéché', codePays: 'TCD' },
  { code: 'TCD-SRH', nom: 'Sarh', codePays: 'TCD' },

  // Tchéquie (CZE)
  { code: 'CZE-PRG', nom: 'Prague', codePays: 'CZE' },
  { code: 'CZE-BRQ', nom: 'Brno', codePays: 'CZE' },
  { code: 'CZE-OSR', nom: 'Ostrava', codePays: 'CZE' },
  { code: 'CZE-PLZ', nom: 'Plzeň', codePays: 'CZE' },
  { code: 'CZE-LIB', nom: 'Liberec', codePays: 'CZE' },

  // Thaïlande (THA)
  { code: 'THA-BKK', nom: 'Bangkok', codePays: 'THA' },
  { code: 'THA-CNX', nom: 'Chiang Mai', codePays: 'THA' },
  { code: 'THA-HKT', nom: 'Phuket', codePays: 'THA' },
  { code: 'THA-HDY', nom: 'Hat Yai', codePays: 'THA' },
  { code: 'THA-NAK', nom: 'Nakhon Ratchasima', codePays: 'THA' },

  // Timor oriental (TLS)
  { code: 'TLS-DIL', nom: 'Dili', codePays: 'TLS' },

  // Togo (TGO)
  { code: 'TGO-LFW', nom: 'Lomé', codePays: 'TGO' },
  { code: 'TGO-SOK', nom: 'Sokodé', codePays: 'TGO' },
  { code: 'TGO-KAR', nom: 'Kara', codePays: 'TGO' },
  { code: 'TGO-ATK', nom: 'Atakpamé', codePays: 'TGO' },

  // Tonga (TON)
  { code: 'TON-TBU', nom: 'Nuku\'alofa', codePays: 'TON' },

  // Trinité-et-Tobago (TTO)
  { code: 'TTO-POS', nom: 'Port-d\'Espagne', codePays: 'TTO' },
  { code: 'TTO-SFO', nom: 'San Fernando', codePays: 'TTO' },
  { code: 'TTO-CHA', nom: 'Chaguanas', codePays: 'TTO' },

  // Tunisie (TUN)
  { code: 'TUN-TUN', nom: 'Tunis', codePays: 'TUN' },
  { code: 'TUN-SFA', nom: 'Sfax', codePays: 'TUN' },
  { code: 'TUN-SOU', nom: 'Sousse', codePays: 'TUN' },
  { code: 'TUN-GAF', nom: 'Gabès', codePays: 'TUN' },
  { code: 'TUN-BIZ', nom: 'Bizerte', codePays: 'TUN' },

  // Turkménistan (TKM)
  { code: 'TKM-ASB', nom: 'Achgabat', codePays: 'TKM' },
  { code: 'TKM-TUR', nom: 'Turkmenabat', codePays: 'TKM' },
  { code: 'TKM-DAS', nom: 'Daşoguz', codePays: 'TKM' },

  // Turquie (TUR)
  { code: 'TUR-ANK', nom: 'Ankara', codePays: 'TUR' },
  { code: 'TUR-IST', nom: 'Istanbul', codePays: 'TUR' },
  { code: 'TUR-IZM', nom: 'Izmir', codePays: 'TUR' },
  { code: 'TUR-ADA', nom: 'Adana', codePays: 'TUR' },
  { code: 'TUR-BUR', nom: 'Bursa', codePays: 'TUR' },
  { code: 'TUR-GAZ', nom: 'Gaziantep', codePays: 'TUR' },
  { code: 'TUR-KON', nom: 'Konya', codePays: 'TUR' },

  // Tuvalu (TUV)
  { code: 'TUV-FUN', nom: 'Funafuti', codePays: 'TUV' },

  // Ukraine (UKR)
  { code: 'UKR-KIV', nom: 'Kiev', codePays: 'UKR' },
  { code: 'UKR-HRK', nom: 'Kharkiv', codePays: 'UKR' },
  { code: 'UKR-ODS', nom: 'Odessa', codePays: 'UKR' },
  { code: 'UKR-LWO', nom: 'Lviv', codePays: 'UKR' },
  { code: 'UKR-DNK', nom: 'Dnipro', codePays: 'UKR' },
  { code: 'UKR-DON', nom: 'Donetsk', codePays: 'UKR' },

  // Uruguay (URY)
  { code: 'URY-MVD', nom: 'Montevideo', codePays: 'URY' },
  { code: 'URY-SAL', nom: 'Salto', codePays: 'URY' },
  { code: 'URY-CYR', nom: 'Paysandú', codePays: 'URY' },

  // Vanuatu (VUT)
  { code: 'VUT-VLI', nom: 'Port-Vila', codePays: 'VUT' },

  // Vatican (VAT)
  { code: 'VAT-VAT', nom: 'Vatican', codePays: 'VAT' },

  // Venezuela (VEN)
  { code: 'VEN-CCS', nom: 'Caracas', codePays: 'VEN' },
  { code: 'VEN-MAR', nom: 'Maracaibo', codePays: 'VEN' },
  { code: 'VEN-VLN', nom: 'Valencia', codePays: 'VEN' },
  { code: 'VEN-BRM', nom: 'Barquisimeto', codePays: 'VEN' },
  { code: 'VEN-MAT', nom: 'Maracay', codePays: 'VEN' },

  // Viêt Nam (VNM)
  { code: 'VNM-HAN', nom: 'Hanoï', codePays: 'VNM' },
  { code: 'VNM-SGN', nom: 'Hô Chi Minh-Ville', codePays: 'VNM' },
  { code: 'VNM-DAD', nom: 'Da Nang', codePays: 'VNM' },
  { code: 'VNM-HPH', nom: 'Haiphong', codePays: 'VNM' },
  { code: 'VNM-CAN', nom: 'Can Tho', codePays: 'VNM' },

  // Yémen (YEM)
  { code: 'YEM-SAH', nom: 'Sanaa', codePays: 'YEM' },
  { code: 'YEM-ADE', nom: 'Aden', codePays: 'YEM' },
  { code: 'YEM-TAI', nom: 'Taëz', codePays: 'YEM' },
  { code: 'YEM-HOD', nom: 'Al-Hudaydah', codePays: 'YEM' },

  // Zambie (ZMB)
  { code: 'ZMB-LUN', nom: 'Lusaka', codePays: 'ZMB' },
  { code: 'ZMB-NLA', nom: 'Ndola', codePays: 'ZMB' },
  { code: 'ZMB-KIT', nom: 'Kitwe', codePays: 'ZMB' },
  { code: 'ZMB-LVI', nom: 'Livingstone', codePays: 'ZMB' },

  // Zimbabwe (ZWE)
  { code: 'ZWE-HRE', nom: 'Harare', codePays: 'ZWE' },
  { code: 'ZWE-BUQ', nom: 'Bulawayo', codePays: 'ZWE' },
  { code: 'ZWE-CHI', nom: 'Chitungwiza', codePays: 'ZWE' },
  { code: 'ZWE-MUT', nom: 'Mutare', codePays: 'ZWE' }
];
