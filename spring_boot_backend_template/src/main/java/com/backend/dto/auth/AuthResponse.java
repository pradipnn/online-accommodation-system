package com.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private String message;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String role;
}