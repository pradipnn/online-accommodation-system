package com.backend.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.dto.auth.AuthResponse;
import com.backend.dto.auth.LoginRequest;
import com.backend.dto.auth.RegisterRequest;
import com.backend.entities.User;
import com.backend.exception.ResourceAlreadyExistsException;
import com.backend.repository.UserRepository;
import com.backend.security.CustomUserDetails;
import com.backend.security.JwtService;
import com.backend.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {

    	if (userRepository.existsByEmail(request.getEmail())) {
    	    throw new ResourceAlreadyExistsException(
    	            "User already exists with email: " + request.getEmail()
    	    );
    	}

    	if (userRepository.existsByPhone(request.getPhone())) {
    	    throw new ResourceAlreadyExistsException(
    	            "User already exists with phone: " + request.getPhone()
    	    );
    	}

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails =
                new CustomUserDetails(savedUser);

        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(
                savedUser,
                token,
                "Registration successful"
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail().toLowerCase().trim(),
                                request.getPassword()
                        )
                );

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        User user = userDetails.getUser();

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Your account is deactivated. Please contact the administrator.");
        }

        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(
                user,
                token,
                "Login successful"
        );
    }

    private AuthResponse buildAuthResponse(
            User user,
            String token,
            String message
    ) {

        return AuthResponse.builder()
                .token(token)
                .message(message)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}