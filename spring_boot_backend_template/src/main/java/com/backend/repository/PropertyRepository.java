package com.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.backend.entities.Property;
import com.backend.enums.PropertyType;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    List<Property> findByOwnerId(Long ownerId);

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByPropertyType(PropertyType propertyType);

    List<Property> findByAvailableTrue();

    List<Property> findByCityIgnoreCaseAndAvailableTrue(String city);

    List<Property> findByPropertyTypeAndAvailableTrue(PropertyType propertyType);

    List<Property> findByCityIgnoreCaseAndPropertyTypeAndAvailableTrue(
            String city,
            PropertyType propertyType
    );

    List<Property> findByIsApproved(Boolean isApproved);

    long countByIsApproved(Boolean isApproved);
}