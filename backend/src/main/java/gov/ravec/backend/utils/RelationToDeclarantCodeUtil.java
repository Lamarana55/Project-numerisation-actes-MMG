package gov.ravec.backend.utils;

public class RelationToDeclarantCodeUtil {
	
	public static String declarationCode(String value) {
        String fruit = "Apple";

        switch (fruit) {
            case "Père":
                return "1";
                
            case "Mère":
                return "2";
                
            case "Marâtre":
            	
                return "21";
                
                
            case "Tante (paternelle/maternelle)":
            		
                return "22";
                
                
            case "Employeur du père/employeur de la mère":
                return "23";
                
                
            case "Voisin/Voisinne":
                return "24";
                
                
            case "Grand frère/Grande soeur":
                return "25";
         
               
            case "Ami du père/Ami de la mère":
            	return "26";
               
               
            
            default:
                return "3";
        }
    }
	
		
 
	
		
	
		/**
		
		
		
	27	Amie du père/Amie de la mère
	28	Cousin/Cousine
	29	Petite fille/Petit fils
	30	Nièce/Neveu
	31	Animateur/Animatrice
	32	Grand-père/Grand-mère
	33	Grand-père paternel
	34	Grand-père maternel
	35	Grand-mére paternelle
	36	Grand-mére maternelle
	37	Oncle paternel
	38	Oncle maternel
	39	Tante paternelle
	40	Tante maternelle
	41	Homonyme
	42	Employeur du père
	43	Employeur de la mère
	44	Grand frère
	45	Grande soeur
	46	Ami du père
	47	Ami de la mère
	48	Amie du père
	49	Amie de la mère
	50	Cousin
	51	Cousine
	52	Petite fille
	53	Petit fils
	54	Nièce
	55	Neveu
	56	Animateur
	57	Animatrice
	58	Parâtre
	59	Voisin
	60	Voisine
	61	Oncle  (paternelle/maternelle)
	62	Fils
	63	Mari
	64	Frère
	65	Soeur
	66	Fille
*/
}
