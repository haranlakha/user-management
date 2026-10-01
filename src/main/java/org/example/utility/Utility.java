package org.example.utility;

import org.hibernate.*;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.example.entity.*;


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

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
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
                System.out.println("User: " + user);
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
