package com.backend.dto.property;

import java.math.BigDecimal;
import java.util.List;

import com.backend.enums.PropertyType;

public class PropertyDto {
	
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

	private List<String> amenities;
	private List<String> imageUrls;

	private Long ownerId;
	private String ownerName;
	
	

}
