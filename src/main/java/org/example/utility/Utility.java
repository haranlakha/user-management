package org.example.utility;

import org.hibernate.*;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.example.entity.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Collections;
import java.util.Properties;


public class Utility {
    private static final SessionFactory sessionFactory = buildSessionFactory();
    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private static SessionFactory buildSessionFactory() {
        try {
            return new Configuration().configure().buildSessionFactory();
        } catch (Throwable sessionFactoryException) {
            System.err.println("buildSessionFactory failed: " + sessionFactoryException.getMessage());
            throw new ExceptionInInitializerError(sessionFactoryException);
        }
    }

    // reads all users from database
    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }


    public static List<User> getAllUsers() {
        Session session = getSessionFactory().openSession();
        try {
            return session.createQuery("from User", User.class).list();
        } catch (Exception e) {
            System.err.println("getAllUsers: sessionFactoryException: " + e.getMessage());
            return Collections.emptyList();
        } finally {
            session.close();
        }
    }

    // Authenticate Admin by username and password
    public static Admin authenticateAdmin(String username, String password) {
        Session session = getSessionFactory().openSession();
        try {
            ensureDefaultAdmin(session);
            Admin admin = session.createQuery(
                "FROM Admin WHERE username = :username", Admin.class)
                    .setParameter("username", username)
                    .uniqueResult();
            return admin != null && passwordEncoder.matches(password, admin.getPassword()) ? admin : null;
        } catch (Exception e) {
            System.err.println("authenticateAdmin error: " + e.getMessage());
            return null;
        } finally {
            session.close();
        }
    }

    // Authenticate Standard User by email AND password (scans decrypted entity attributes)
    public static User authenticateUser(String email, String password) {
        Session session = getSessionFactory().openSession();
        try {
            List<User> users = session.createQuery("FROM User", User.class).list();
            for (User u : users) {
                if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(email.trim())
                        && u.getPassword() != null && password != null
                        && passwordEncoder.matches(password, u.getPassword())) {
                    return u;
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("authenticateUser error: " + e.getMessage());
            return null;
        } finally {
            session.close();
        }
    }

    // Creates new admin in database
    public static void createAdmin(Admin admin) {
        Session session = getSessionFactory().openSession();
        Transaction transaction = null;
        try {
            transaction = session.beginTransaction();
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            session.persist(admin);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            System.err.println("createAdmin error: " + e.getMessage());
            throw new RuntimeException("Failed to create admin: " + e.getMessage(), e);
        } finally {
            session.close();
        }
    }

    // Check if an admin username is already registered
    public static boolean isAdminUsernameTaken(String username) {
        Session session = getSessionFactory().openSession();
        try {
            Long count = session.createQuery(
                "SELECT COUNT(a) FROM Admin a WHERE LOWER(a.username) = LOWER(:username)", Long.class)
                    .setParameter("username", username.trim())
                    .uniqueResult();
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        } finally {
            session.close();
        }
    }

    // Check if a standard user email is already registered
    public static boolean isUserEmailTaken(String email) {
        Session session = getSessionFactory().openSession();
        try {
            List<User> users = session.createQuery("FROM User", User.class).list();
            for (User u : users) {
                if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(email.trim())) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        } finally {
            session.close();
        }
    }

    // Creates default admin from postgresql.conf if none exists
    private static void ensureDefaultAdmin(Session session) {
        try {
            Long count = session.createQuery("SELECT COUNT(a) FROM Admin a", Long.class).uniqueResult();
            if (count == null || count == 0) {
                Properties config = loadConfig();
                String username = config.getProperty("admin.username");
                String password = config.getProperty("admin.password");
                if (username == null || username.isBlank() || password == null || password.isBlank()) {
                    System.out.println(">> No default admin configured (set admin.username and admin.password in postgresql.conf)");
                    return;
                }

                Transaction tx = session.beginTransaction();
                Admin defaultAdmin = new Admin();
                defaultAdmin.setUsername(username.trim());
                defaultAdmin.setPassword(passwordEncoder.encode(password));
                session.persist(defaultAdmin);
                tx.commit();
                System.out.println(">> Created default admin account '" + username.trim() + "'");
            }
        } catch (Exception e) {
            System.err.println("ensureDefaultAdmin error: " + e.getMessage());
        }
    }

    // Reads postgresql.conf from the classpath
    private static Properties loadConfig() {
        Properties properties = new Properties();
        try (InputStream input = Utility.class.getClassLoader().getResourceAsStream("postgresql.conf")) {
            if (input != null) {
                properties.load(input);
            }
        } catch (IOException e) {
            System.err.println("loadConfig error: " + e.getMessage());
        }
        return properties;
    }

    //creates new user in database
    public static void createUser(User user) {

        Session session = getSessionFactory().openSession();
        Transaction transaction = null;

        try {
            transaction = session.beginTransaction();
            // Users created through /api/users have no password
            if (user.getPassword() != null) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            session.persist(user);
            transaction.commit();
        } catch (Exception sessionFactoryException) {
            if(transaction != null) {
                transaction.rollback();
            }
            System.err.println("createUser: sessionFactoryException: " + sessionFactoryException.getMessage());
            throw new RuntimeException("Failed to create user: " + sessionFactoryException.getMessage(), sessionFactoryException);
        } finally {
            session.close();
        }
    }

    //reads user from database
    public static void readUser(int id) {

        Session session = getSessionFactory().openSession();

        try {
            User user = session.getReference(User.class, id);

            if(user != null) {
                System.out.println("Name: " + user.getName() + "\nEmail: " + user.getEmail() + "\nAge: " + user.getAge());
            } else {
                System.out.println("Failed to read user");
            }
        } catch (Exception sessionFactoryException) {
            System.err.println("readUser: sessionFactoryException: " + sessionFactoryException.getMessage());
        } finally {
            session.close();
        }
    }

    //updates user details in database
    public static void updateUser(int id, String newName, String newEmail) {

        Session session = getSessionFactory().openSession();
        Transaction transaction = null;

        try {
            User updateUser = session.getReference(User.class, id);

            if(updateUser != null) {
                transaction = session.beginTransaction();
                updateUser.setName(newName);
                updateUser.setEmail(newEmail);
                session.merge(updateUser);
                transaction.commit();
            } else  {
                System.out.println("Failed to update user");
            }

        } catch (Exception sessionFactoryException) {
            if(transaction != null) {
                transaction.rollback();
            }
            System.err.println("updateUser: sessionFactoryException: " + sessionFactoryException.getMessage());
        } finally {
            session.close();
        }
    }

    //deletes user from database
    public static void deleteUser(int id) {

        Session session = getSessionFactory().openSession();
        Transaction transaction = null;

        try {
            User deleteUser = session.getReference(User.class, id);

            if(deleteUser != null) {
                transaction = session.beginTransaction();
                session.remove(deleteUser);
                transaction.commit();
            }

        } catch (Exception sessionFactoryException) {
            if(transaction != null) {
                transaction.rollback();
            }
            System.err.println("deleteUser: sessionFactoryException: " + sessionFactoryException.getMessage());
        } finally {
            session.close();
        }
    }
}
