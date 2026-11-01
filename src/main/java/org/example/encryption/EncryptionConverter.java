package org.example.encryption;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

@Converter
public class EncryptionConverter implements AttributeConverter<Object, String> {

    // AES-256-GCM with a random IV per value
    private static final TextEncryptor ENCRYPTOR;

    static {
        Properties properties = new Properties();
        try (InputStream input = EncryptionConverter.class.getClassLoader().getResourceAsStream("postgresql.conf")) {
            if (input == null) {
                throw new RuntimeException("Unable to find postgresql.conf in the classpath");
            }
            properties.load(input);
            String password = properties.getProperty("encryption.password");
            String salt = properties.getProperty("encryption.salt");

            if (password == null || password.isBlank() || salt == null || !salt.matches("[0-9a-fA-F]+") || salt.length() % 2 != 0) {
                throw new RuntimeException("encryption.password and a hex encryption.salt must be defined in postgresql.conf");
            }
            ENCRYPTOR = Encryptors.delux(password, salt);
        } catch (IOException e) {
            throw new ExceptionInInitializerError("Failed to load encryption key: " + e.getMessage());
        }
    }

    @Override
    public String convertToDatabaseColumn(Object attribute) {
        if (attribute == null) {
            return null;
        }
        String typePrefix = attribute.getClass().getSimpleName() + ":";
        return ENCRYPTOR.encrypt(typePrefix + attribute);
    }

    @Override
    public Object convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        String decrypted = ENCRYPTOR.decrypt(dbData);

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
    }
}
