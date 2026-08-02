package com.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.property.PropertyResponse;
import com.backend.entities.User;
import com.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {

        List<User> users =
                adminService.getAllUsers();

        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam boolean active) {

        User user = adminService.updateUserStatus(userId, active);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/properties/pending")
    public ResponseEntity<List<PropertyResponse>>
            getPendingProperties() {

        List<PropertyResponse> properties =
                adminService.getPendingProperties();

        return ResponseEntity.ok(properties);
    }

    @GetMapping("/owners/pending")
    public ResponseEntity<List<User>>
            getPendingOwners() {

        List<User> owners =
                adminService.getPendingOwners();

        return ResponseEntity.ok(owners);
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Long>>
            getReports() {

        Map<String, Long> reports =
                adminService.getReports();

        return ResponseEntity.ok(reports);
    }

    @PutMapping("/properties/{propertyId}/approve")
    public ResponseEntity<PropertyResponse>
            approveProperty(
                    @PathVariable Long propertyId) {

        PropertyResponse property =
                adminService.approveProperty(propertyId);

        return ResponseEntity.ok(property);
    }

    @PutMapping("/owners/{ownerId}/approve")
    public ResponseEntity<User> approveOwner(
            @PathVariable Long ownerId) {

        User owner =
                adminService.approveOwner(ownerId);

        return ResponseEntity.ok(owner);
    }
}