package com.backend.service;

import java.util.List;
import java.util.Map;

import com.backend.dto.property.PropertyResponse;
import com.backend.entities.User;

public interface AdminService {

    List<User> getAllUsers();

    List<PropertyResponse> getPendingProperties();

    List<User> getPendingOwners();

    Map<String, Long> getReports();

    PropertyResponse approveProperty(Long propertyId);

    User approveOwner(Long ownerId);

    User updateUserStatus(Long userId, boolean active);
}