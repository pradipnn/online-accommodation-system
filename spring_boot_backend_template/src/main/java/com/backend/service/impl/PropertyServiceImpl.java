package com.backend.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.backend.dto.property.PropertyRequest;
import com.backend.dto.property.PropertyResponse;
import com.backend.entities.Property;
import com.backend.entities.User;
import com.backend.enums.PropertyType;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.PropertyRepository;
import com.backend.repository.UserRepository;
import com.backend.service.PropertyService;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Override
    public PropertyResponse addProperty(PropertyRequest request) {

        validatePropertyRequest(request);

        User owner = getCurrentUser();

        Property property = new Property();

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(request.getPropertyType());

        property.setAddressLine(request.getAddressLine());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPincode(request.getPincode());

        property.setMonthlyRent(request.getMonthlyRent());
        property.setCapacity(request.getCapacity());

        if (request.getAvailable() == null) {
            property.setAvailable(true);
        } else {
            property.setAvailable(request.getAvailable());
        }

        if (request.getAmenities() != null) {
            List<String> distinctAmenities = request.getAmenities().stream()
                    .filter(a -> a != null && !a.trim().isEmpty())
                    .distinct()
                    .toList();
            property.setAmenities(new ArrayList<>(distinctAmenities));
        } else {
            property.setAmenities(new ArrayList<>());
        }

        if (request.getImageUrls() == null) {
            property.setImageUrls(new ArrayList<>());
        } else {
            property.setImageUrls(request.getImageUrls());
        }

        property.setOwner(owner);

        Property savedProperty = propertyRepository.save(property);

        return mapToResponse(savedProperty);
    }

    @Override
    public PropertyResponse updateProperty(
            Long propertyId,
            PropertyRequest request) {

        validatePropertyRequest(request);

        Property property = getPropertyEntityById(propertyId);

        checkPropertyOwner(property);

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(request.getPropertyType());

        property.setAddressLine(request.getAddressLine());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPincode(request.getPincode());

        property.setMonthlyRent(request.getMonthlyRent());
        property.setCapacity(request.getCapacity());

        if (request.getAvailable() != null) {
            property.setAvailable(request.getAvailable());
        }

        if (request.getAmenities() != null) {
            List<String> distinctAmenities = request.getAmenities().stream()
                    .filter(a -> a != null && !a.trim().isEmpty())
                    .distinct()
                    .toList();
            property.setAmenities(new ArrayList<>(distinctAmenities));
        }

        if (request.getImageUrls() != null) {
            property.setImageUrls(request.getImageUrls());
        }

        Property updatedProperty = propertyRepository.save(property);

        return mapToResponse(updatedProperty);
    }

    @Override
    public void deleteProperty(Long propertyId) {

        Property property = getPropertyEntityById(propertyId);

        checkPropertyOwner(property);

        propertyRepository.delete(property);
    }

    @Override
    public PropertyResponse getPropertyById(Long propertyId) {

        Property property = getPropertyEntityById(propertyId);

        return mapToResponse(property);
    }

    @Override
    public List<PropertyResponse> getAllProperties() {

        List<Property> properties =
                propertyRepository.findByAvailableTrue();

        return mapToResponseList(properties);
    }

    @Override
    public List<PropertyResponse> getMyProperties() {

        User owner = getCurrentUser();

        List<Property> properties =
                propertyRepository.findByOwnerId(owner.getId());

        return mapToResponseList(properties);
    }

    @Override
    public List<PropertyResponse> searchProperties(
            String city,
            PropertyType propertyType,
            BigDecimal minRent,
            BigDecimal maxRent,
            Integer minCapacity,
            String keyword,
            Boolean available) {

        if (minRent != null && maxRent != null && minRent.compareTo(maxRent) > 0) {
            throw new RuntimeException("Minimum rent cannot be greater than maximum rent");
        }

        Specification<Property> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (available != null) {
                predicates.add(cb.equal(root.get("available"), available));
            } else {
                predicates.add(cb.equal(root.get("available"), true));
            }

            predicates.add(cb.or(
                    cb.isNull(root.get("isApproved")),
                    cb.equal(root.get("isApproved"), true)
            ));

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.trim().toLowerCase() + "%"));
            }

            if (propertyType != null) {
                predicates.add(cb.equal(root.get("propertyType"), propertyType));
            }

            if (minRent != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("monthlyRent"), minRent));
            }

            if (maxRent != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("monthlyRent"), maxRent));
            }

            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), kw);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), kw);
                Predicate cityMatch = cb.like(cb.lower(root.get("city")), kw);
                Predicate addressMatch = cb.like(cb.lower(root.get("addressLine")), kw);
                predicates.add(cb.or(titleMatch, descMatch, cityMatch, addressMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Property> properties = propertyRepository.findAll(spec);
        return mapToResponseList(properties);
    }

    private void validatePropertyRequest(PropertyRequest request) {
        if (request == null) {
            throw new RuntimeException("Property request is required");
        }

        if (request.getPropertyType() == null) {
            throw new RuntimeException("Property type is required");
        }

        if (request.getMonthlyRent() == null || request.getMonthlyRent().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Monthly rent/price must be greater than zero");
        }

        if (request.getCapacity() == null || request.getCapacity() < 1) {
            throw new RuntimeException("Capacity must be at least 1");
        }
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        )
                );
    }

    private Property getPropertyEntityById(Long propertyId) {

        return propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found with id: "
                                        + propertyId
                        )
                );
    }

    private void checkPropertyOwner(Property property) {

        User currentUser = getCurrentUser();

        if (!property.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You are not allowed to modify this property"
            );
        }
    }

    private List<PropertyResponse> mapToResponseList(
            List<Property> properties) {

        List<PropertyResponse> responses =
                new ArrayList<>();

        for (Property property : properties) {
            responses.add(mapToResponse(property));
        }

        return responses;
    }

    private PropertyResponse mapToResponse(
            Property property) {

        PropertyResponse response =
                new PropertyResponse();

        response.setId(property.getId());
        response.setTitle(property.getTitle());
        response.setDescription(property.getDescription());

        response.setPropertyType(
                property.getPropertyType()
        );

        response.setAddressLine(
                property.getAddressLine()
        );

        response.setCity(property.getCity());
        response.setState(property.getState());
        response.setPincode(property.getPincode());

        response.setMonthlyRent(
                property.getMonthlyRent()
        );

        response.setCapacity(property.getCapacity());
        response.setAvailable(property.getAvailable());
        response.setIsApproved(property.getIsApproved());

        response.setAmenities(property.getAmenities());
        response.setImageUrls(property.getImageUrls());

        if (property.getOwner() != null) {
            response.setOwnerId(property.getOwner().getId());
            String firstName = property.getOwner().getFirstName() != null ? property.getOwner().getFirstName() : "";
            String lastName = property.getOwner().getLastName() != null ? property.getOwner().getLastName() : "";
            String ownerName = (firstName + " " + lastName).trim();
            response.setOwnerName(ownerName.isEmpty() ? "Property Owner" : ownerName);
            response.setOwnerPhone(property.getOwner().getPhone());
        }

        response.setCreatedAt(property.getCreatedAt());
        response.setUpdatedAt(property.getUpdatedAt());

        return response;
    }
}
