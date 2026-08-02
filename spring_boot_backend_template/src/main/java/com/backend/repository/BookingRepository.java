package com.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.entities.Booking;
import com.backend.enums.BookingStatus;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByRoomId(Long roomId);

    List<Booking> findByStatus(BookingStatus status);

    @Query("""
            SELECT DISTINCT b
            FROM Booking b
            LEFT JOIN FETCH b.user
            LEFT JOIN FETCH b.property p
            LEFT JOIN FETCH b.room
            WHERE p.owner.id = :ownerId
            ORDER BY b.createdAt DESC
            """)
    List<Booking> findBookingsByOwnerId(
            @Param("ownerId") Long ownerId
    );

    boolean existsByRoomIdAndStatusNotAndCheckInDateLessThanAndCheckOutDateGreaterThan(
            Long roomId,
            BookingStatus status,
            LocalDate checkOutDate,
            LocalDate checkInDate
    );
}