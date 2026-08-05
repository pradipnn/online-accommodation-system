package com.backend.dto.Wishlist;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WishlistResponse {

    private Long id;

    private Long propertyId;
    private String propertyTitle;
    private String propertyImageUrl;

    private String city;
    private String state;

    private BigDecimal monthlyRent;
    private String propertyType;

    private LocalDateTime createdAt;

    public WishlistResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public void setPropertyTitle(
            String propertyTitle) {

        this.propertyTitle = propertyTitle;
    }

    public String getPropertyImageUrl() {
        return propertyImageUrl;
    }

    public void setPropertyImageUrl(
            String propertyImageUrl) {

        this.propertyImageUrl = propertyImageUrl;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public void setMonthlyRent(
            BigDecimal monthlyRent) {

        this.monthlyRent = monthlyRent;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(
            String propertyType) {

        this.propertyType = propertyType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }
}