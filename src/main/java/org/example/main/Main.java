package org.example.main;

import org.example.entity.User;
import org.example.utility.Utility;

import java.util.Scanner;

public class Main {
    static void main(String[] args) {

        String name;
        String email;
        int age;

        User newUser =  new User();
        Scanner scnr = new Scanner(System.in);

        System.out.println("Enter your name: ");
        name = scnr.nextLine();

        System.out.println("Enter your email: ");
        email = scnr.nextLine();

        System.out.println("Enter your age: ");
        age = scnr.nextInt();

        scnr.close();

        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setAge(age);

        Utility.createUser(newUser);




    }
}
