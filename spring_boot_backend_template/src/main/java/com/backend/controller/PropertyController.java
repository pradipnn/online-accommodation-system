package com.backend.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.property.PropertyRequest;
import com.backend.dto.property.PropertyResponse;
import com.backend.enums.PropertyType;
import com.backend.service.PropertyService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/properties")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public ResponseEntity<PropertyResponse> addProperty(
            @Valid @RequestBody PropertyRequest request) {

        PropertyResponse response =
                propertyService.addProperty(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{propertyId}")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long propertyId,
            @Valid @RequestBody PropertyRequest request) {

        PropertyResponse response =
                propertyService.updateProperty(
                        propertyId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<String> deleteProperty(
            @PathVariable Long propertyId) {

        propertyService.deleteProperty(propertyId);

        return ResponseEntity.ok(
                "Property deleted successfully"
        );
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyResponse> getPropertyById(
            @PathVariable Long propertyId) {

        PropertyResponse response =
                propertyService.getPropertyById(propertyId);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>>
            getAllProperties() {

        return ResponseEntity.ok(
                propertyService.getAllProperties()
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<PropertyResponse>>
            getMyProperties() {

        return ResponseEntity.ok(
                propertyService.getMyProperties()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) BigDecimal minRent,
            @RequestParam(required = false) BigDecimal maxRent,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean available) {

        return ResponseEntity.ok(
                propertyService.searchProperties(
                        city,
                        propertyType,
                        minRent,
                        maxRent,
                        minCapacity,
                        keyword,
                        available
                )
        );
    }
}
