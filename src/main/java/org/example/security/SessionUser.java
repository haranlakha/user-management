package org.example.security;

import java.util.Objects;

public class SessionUser implements java.io.Serializable {

    private final int id;
    private final String role;

    public SessionUser(int id, String role) {
        this.id = id;
        this.role = role;
    }

    public int getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        SessionUser that = (SessionUser) o;
        return this.id == that.id && Objects.equals(this.role, that.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, role);
    }

    @Override
    public String toString() {
        return "SessionUser{" + "id=" + id + ", role=" + role + '}';
    }
}
