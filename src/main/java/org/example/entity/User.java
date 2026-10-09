package org.example.entity;

import jakarta.persistence.*;
import org.example.encryption.EncryptionConverter;

@Entity
@Table(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Convert(converter = EncryptionConverter.class)
    private String name;

    @Convert(converter = EncryptionConverter.class)
    private String email;

    @Convert(converter = EncryptionConverter.class)
    private int age;


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
