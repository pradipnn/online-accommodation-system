package com.backend.dto.Room;

import java.math.BigDecimal;

import com.backend.enums.RoomType;

public class RoomResponse {

    private Long id;
    private String roomNumber;
    private RoomType roomType;

    private Integer capacity;
    private Integer bookedBeds;
    private Integer availableBeds;

    private BigDecimal monthlyRent;
    private Boolean available;
    private Long propertyId;
   

    public RoomResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(
            String roomNumber) {

        this.roomNumber = roomNumber;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(
            RoomType roomType) {

        this.roomType = roomType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(
            Integer capacity) {

        this.capacity = capacity;
    }

    public Integer getBookedBeds() {
        return bookedBeds;
    }

    public void setBookedBeds(
            Integer bookedBeds) {

        this.bookedBeds = bookedBeds;
    }

    public Integer getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(
            Integer availableBeds) {

        this.availableBeds = availableBeds;
    }

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public void setMonthlyRent(
            BigDecimal monthlyRent) {

        this.monthlyRent = monthlyRent;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(
            Boolean available) {

        this.available = available;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(
            Long propertyId) {

        this.propertyId = propertyId;
    }
}