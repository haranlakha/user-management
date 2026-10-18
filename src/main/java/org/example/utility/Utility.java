package org.example.utility;

import org.hibernate.*;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.example.entity.*;
import java.util.List;
import java.util.Collections;


public class Utility {
    private static final SessionFactory sessionFactory = buildSessionFactory();

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
            return session.createQuery(
                "FROM Admin WHERE username = :username AND password = :password", Admin.class)
                    .setParameter("username", username)
                    .setParameter("password", password)
                    .uniqueResult();
        } catch (Exception e) {
            System.err.println("authenticateAdmin error: " + e.getMessage());
            return null;
        } finally {
            session.close();
        }
    }

    // Authenticate Standard User by email or name (scans decrypted entity attributes)
    public static User authenticateUser(String emailOrName) {
        Session session = getSessionFactory().openSession();
        try {
            List<User> users = session.createQuery("FROM User", User.class).list();
            for (User u : users) {
                if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(emailOrName.trim())) {
                    return u;
                }
                if (u.getName() != null && u.getName().equalsIgnoreCase(emailOrName.trim())) {
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

    // Creates default admin if none exists
    private static void ensureDefaultAdmin(Session session) {
        try {
            Long count = session.createQuery("SELECT COUNT(a) FROM Admin a", Long.class).uniqueResult();
            if (count == null || count == 0) {
                Transaction tx = session.beginTransaction();
                Admin defaultAdmin = new Admin();
                defaultAdmin.setUsername("admin");
                defaultAdmin.setPassword("admin123");
                session.persist(defaultAdmin);
                tx.commit();
                System.out.println(">> Seeded default admin account: username='admin', password='admin123'");
            }
        } catch (Exception e) {
            System.err.println("ensureDefaultAdmin error: " + e.getMessage());
        }
    }

    //creates new user in database
    public static void createUser(User user) {

        Session session = getSessionFactory().openSession();
        Transaction transaction = null;

        try {
            transaction = session.beginTransaction();
            session.persist(user);
            transaction.commit();
        } catch (Exception sessionFactoryException) {
            if(transaction != null) {
                transaction.rollback();
            }
            System.err.println("createUser: sessionFactoryException: " + sessionFactoryException.getMessage());
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
