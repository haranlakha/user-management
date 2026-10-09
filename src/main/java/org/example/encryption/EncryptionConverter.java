package org.example.encryption;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.InputStream;
import java.security.Key;
import java.util.Base64;
import java.util.Properties;

@Converter
public class EncryptionConverter implements AttributeConverter<Object, String> {

    private static final String ALGORITHM = "AES";
    private static final byte[] KEY;

    static {
        Properties properties = new Properties();
        try (InputStream input = EncryptionConverter.class.getClassLoader().getResourceAsStream("postgresql.conf")) {
            if (input == null) {
                throw new RuntimeException("Unable to find postgresql.conf in the classpath");
            }
            properties.load(input);
            String secretKey = properties.getProperty("encryption.key");

            if (secretKey == null || secretKey.length() != 16) {
                throw new RuntimeException("encryption.key must be defined in postgres.conf and exactly 16 characters long for AES-128");
            }
            KEY = secretKey.getBytes();
        } catch (IOException e) {
            throw new ExceptionInInitializerError("Failed to load encryption key: " + e.getMessage());
        }
    }

    @Override
    public String convertToDatabaseColumn(Object attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            Key key = new SecretKeySpec(KEY, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);

            String typePrefix = attribute.getClass().getSimpleName() + ":";
            String payload = typePrefix + attribute;

            return Base64.getEncoder().encodeToString(cipher.doFinal(payload.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting data", e);
        }
    }

    @Override
    public Object convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            Key key = new SecretKeySpec(KEY, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);

            String decrypted = new String(cipher.doFinal(Base64.getDecoder().decode(dbData)));

            int splitIndex = decrypted.indexOf(':');

            if (splitIndex == -1) {
                return decrypted;
            }

            String type = decrypted.substring(0, splitIndex);
            String value = decrypted.substring(splitIndex + 1);

            if ("Integer".equals(type)) {
                return Integer.valueOf(value);
            }

            return value;

        } catch (Exception e) {
            throw new RuntimeException("Error decrypting data", e);
        }
    }
}