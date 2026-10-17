package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

import java.io.File;
import java.io.IOException;
import java.net.Socket;

// Exclude default DataSource auto-configuration since Utility uses its own hibernate.cfg.xml
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class})
public class Application {
    public static void main(String[] args) {
        startFrontendServer();
        SpringApplication.run(Application.class, args);
    }

    private static void startFrontendServer() {
        if(!isPortAvailable(3000)) {
            System.out.println("Frontend Server already running on port 3000");
            return;
        }

        File frontendServer = new File("frontend");
        if (!frontendServer.exists()) {
            return;
        }

        try {
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            String npmCmd = isWindows ? "npm.cmd" : "npm";

            ProcessBuilder processBuilder = new ProcessBuilder(npmCmd, "run", "dev");

            processBuilder.directory(frontendServer);
            processBuilder.inheritIO();

            Process process = processBuilder.start();
            System.out.println("Frontend Server started on port 3000");

            long processId = process.pid();

            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("Shutting down Frontend Server");
                try {
                    if (isWindows) {
                        new ProcessBuilder("taskkill", "/F", "/T", "/PID", String.valueOf(processId)).start().waitFor();
                    } else {
                        process.descendants().forEach(ProcessHandle::destroyForcibly);
                        process.destroyForcibly();
                    }
                } catch (Exception shutdownFrontendException) {
                    process.destroyForcibly();
                }
            }));

        } catch (Exception frontendServerException) {
            System.out.println("Frontend Server could not be started: " + frontendServerException.getMessage());
        }
    }

    private static Boolean isPortAvailable(int port) {
        try (Socket socket = new Socket("localhost", port)){
            return false;
        } catch (IOException e) {
            return true;
        }
    }
}
