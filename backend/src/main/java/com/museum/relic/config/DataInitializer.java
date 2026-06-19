package com.museum.relic.config;

import com.museum.relic.entity.User;
import com.museum.relic.entity.UserRole;
import com.museum.relic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .realName("系统管理员")
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("restorer")) {
            User restorer = User.builder()
                    .username("restorer")
                    .password(passwordEncoder.encode("restorer123"))
                    .realName("张修复师")
                    .role(UserRole.RESTORER)
                    .build();
            userRepository.save(restorer);
        }

        if (!userRepository.existsByUsername("restorer2")) {
            User restorer2 = User.builder()
                    .username("restorer2")
                    .password(passwordEncoder.encode("restorer123"))
                    .realName("李修复师")
                    .role(UserRole.RESTORER)
                    .build();
            userRepository.save(restorer2);
        }
    }
}
