package com.backend.service.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.property.PropertyResponse;
import com.backend.entities.Property;
import com.backend.entities.User;
import com.backend.enums.Role;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.BookingRepository;
import com.backend.repository.PropertyRepository;
import com.backend.repository.ReviewRepository;
import com.backend.repository.UserRepository;
import com.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> getPendingProperties() {

        List<Property> properties =
                propertyRepository.findByIsApproved(false);

        return mapToResponseList(properties);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getPendingOwners() {

        return userRepository.findByRoleAndIsApproved(
                Role.OWNER,
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getReports() {

        Map<String, Long> reports =
                new LinkedHashMap<>();

        reports.put(
                "totalUsers",
                userRepository.count()
        );

        reports.put(
                "totalOwners",
                userRepository.countByRole(Role.OWNER)
        );

        reports.put(
                "totalProperties",
                propertyRepository.count()
        );

        reports.put(
                "pendingProperties",
                propertyRepository.countByIsApproved(false)
        );

        reports.put(
                "totalBookings",
                bookingRepository.count()
        );

        reports.put(
                "totalReviews",
                reviewRepository.count()
        );

        return reports;
    }

    @Override
    public PropertyResponse approveProperty(Long propertyId) {

        Property property =
                propertyRepository.findById(propertyId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found with id: "
                                                + propertyId
                                )
                        );

        property.setIsApproved(true);

        Property updatedProperty =
                propertyRepository.save(property);

        return mapToResponse(updatedProperty);
    }

    @Override
    public User approveOwner(Long ownerId) {

        User owner =
                userRepository.findById(ownerId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Owner not found with id: "
                                                + ownerId
                                )
                        );

        if (owner.getRole() != Role.OWNER) {

            throw new RuntimeException(
                    "User with id "
                            + ownerId
                            + " is not an owner"
            );
        }

        owner.setIsApproved(true);

        return userRepository.save(owner);
    }

    @Override
    public User updateUserStatus(Long userId, boolean active) {

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        if (targetUser.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be activated or deactivated.");
        }

        targetUser.setIsActive(active);

        return userRepository.save(targetUser);
    }

    private List<PropertyResponse> mapToResponseList(
            List<Property> properties) {

        List<PropertyResponse> responses =
                new ArrayList<>();

        for (Property property : properties) {

            PropertyResponse response =
                    mapToResponse(property);

            responses.add(response);
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

        response.setCapacity(
                property.getCapacity()
        );

        response.setAvailable(
                property.getAvailable()
        );

        response.setIsApproved(
                property.getIsApproved()
        );

        response.setAmenities(
                property.getAmenities()
        );

        response.setImageUrls(
                property.getImageUrls()
        );

        if (property.getOwner() != null) {

            response.setOwnerId(
                    property.getOwner().getId()
            );

            String ownerName =
                    property.getOwner().getFirstName()
                            + " "
                            + property.getOwner().getLastName();

            response.setOwnerName(
                    ownerName.trim()
            );
        }

        response.setCreatedAt(
                property.getCreatedAt()
        );

        response.setUpdatedAt(
                property.getUpdatedAt()
        );

        return response;
    }
}