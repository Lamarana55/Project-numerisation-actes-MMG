package gov.ravec.backend.utils;

import javax.crypto.Cipher;


import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author condeis
 */
public class EncryptionUtils {
	private static final Logger logger = LoggerFactory.getLogger(EncryptionUtils.class);

 

	// Encrypt the given string using AES
	public static String encrypt(String data, SecretKey secretKey) throws Exception {
		if ( data==null)
			return null;
		Cipher cipher = Cipher.getInstance("AES");
		cipher.init(Cipher.ENCRYPT_MODE, secretKey);
		byte[] encryptedBytes = cipher.doFinal(data.getBytes());
		return Base64.getEncoder().encodeToString(encryptedBytes);
	}

	// Decrypt the given string using AES
	public static String decrypt(String encryptedData, SecretKey secretKey) throws Exception {
		if ( encryptedData==null)
			return null;
		Cipher cipher = Cipher.getInstance("AES");
		cipher.init(Cipher.DECRYPT_MODE, secretKey);
		byte[] decodedBytes = Base64.getDecoder().decode(encryptedData);
		byte[] decryptedBytes = cipher.doFinal(decodedBytes);
		return new String(decryptedBytes);
	}

	// Encrypt a list of names
	public static List<String> encryptNames(List<String> names, SecretKey secretKey) throws Exception {
		return names.stream().map(name -> {
			try {
				return encrypt(name, secretKey); // Encrypt each name
			} catch (Exception e) {
				e.printStackTrace();
				return null;
			}
		}).collect(Collectors.toList());
	}

	// Decrypt a list of names
	public static List<String> decryptNames(List<String> encryptedNames, SecretKey secretKey) throws Exception {
		return encryptedNames.stream().map(encryptedName -> {
			try {
				return decrypt(encryptedName, secretKey); // Decrypt each name
			} catch (Exception e) {
				e.printStackTrace();
				return null;
			}
		}).collect(Collectors.toList());
	}

	
	
	
}
