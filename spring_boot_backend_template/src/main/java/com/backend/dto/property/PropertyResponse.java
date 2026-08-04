package com.backend.dto.property;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.backend.enums.PropertyType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {

    private Long id;

    private String title;

    private String description;

    private PropertyType propertyType;

    private String addressLine;

    private String city;

    private String state;

    private String pincode;

    private BigDecimal monthlyRent;

    private Integer capacity;

    private Boolean available;

    private Boolean isApproved;

    private List<String> amenities;

    private List<String> imageUrls;

    private Long ownerId;

    private String ownerName;

    private String ownerPhone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}