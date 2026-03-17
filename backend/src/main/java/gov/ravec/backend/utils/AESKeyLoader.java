package gov.ravec.backend.utils;


	import javax.crypto.SecretKey;
	import java.io.FileInputStream;
	import java.io.ObjectInputStream;

	/**
	 * @author condeis
	 */
	public class AESKeyLoader {
	    public static SecretKey loadAESKey(String filePath) throws Exception {
	        try (FileInputStream fileIn = new FileInputStream(filePath);
	             ObjectInputStream in = new ObjectInputStream(fileIn)) {
	            return (SecretKey) in.readObject();
	        }
	    }
	}



