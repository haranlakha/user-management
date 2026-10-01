# User Management

User Management application, utilising [Hibernate](https://hibernate.org/orm/) and [PostgreSQL](https://www.postgresql.org/).

## Setup

You will need to create a hibernate.cfg.xml file. This will be stored in the 'resources' folder:

<img width="346" height="41" alt="image" src="https://github.com/user-attachments/assets/75cf506e-1c75-4234-bc2e-1cbf430e1f87" />

Example XML file:

```
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        " http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">

<hibernate-configuration>
    <session-factory>
        <property name="hibernate.connection.driver_class">org.postgresql.Driver</property>
        <property name="hibernate.connection.url">jdbc:postgresql://localhost:5432/db_name</property>
        <property name="hibernate.connection.username">username</property>
        <property name="hibernate.connection.password">password</property>
        <property name="hibernate.hbm2ddl.auto">update</property>
        <property name="hibernate.show_sql">true</property>
        <mapping class="org.example.entity.User" />
    </session-factory>
</hibernate-configuration>
```


## Installation

```
git clone https://github.com/haranlakha/user-management.git
```

## Compile code

Build the application in your favourite IDE e.g. [IntelliJ IDEA](https://www.jetbrains.com/idea/).

## Run code

Run the application in your IDE:

<img width="178" height="124" alt="image" src="https://github.com/user-attachments/assets/75704b62-b64c-42e4-a5ff-8e758063af60" />


<br>
<img width="513" height="65" alt="image" src="https://github.com/user-attachments/assets/58176eeb-2da1-442c-b76b-fbeea04de198" />




