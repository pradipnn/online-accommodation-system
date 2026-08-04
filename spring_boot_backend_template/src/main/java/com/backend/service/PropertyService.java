package com.backend.service;

import java.math.BigDecimal;
import java.util.List;

import com.backend.dto.property.PropertyRequest;
import com.backend.dto.property.PropertyResponse;
import com.backend.enums.PropertyType;

public interface PropertyService {

    PropertyResponse addProperty(PropertyRequest request);

    PropertyResponse updateProperty(
            Long propertyId,
            PropertyRequest request
    );

    void deleteProperty(Long propertyId);

    PropertyResponse getPropertyById(Long propertyId);

    List<PropertyResponse> getAllProperties();

    List<PropertyResponse> getMyProperties();

    List<PropertyResponse> searchProperties(
            String city,
            PropertyType propertyType,
            BigDecimal minRent,
            BigDecimal maxRent,
            Integer minCapacity,
            String keyword,
            Boolean available
    );
}