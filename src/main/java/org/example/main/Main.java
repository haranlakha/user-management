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


        System.out.println("Enter user name: ");
        name = scnr.nextLine();
        newUser.setName(name);

        System.out.println("Enter user email: ");
        email = scnr.nextLine();
        newUser.setEmail(email);

        System.out.println("Enter age:");
        age = scnr.nextInt();
        newUser.setAge(age);

        Utility.createUser(newUser);




    }
}
