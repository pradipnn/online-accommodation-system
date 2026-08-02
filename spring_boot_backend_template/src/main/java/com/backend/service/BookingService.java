package com.backend.service;

import java.util.List;

import com.backend.dto.Booking.BookingRequest;
import com.backend.dto.Booking.BookingResponse;
import com.backend.enums.BookingStatus;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    BookingResponse getBookingById(Long bookingId);

    List<BookingResponse> getMyBookings();

    List<BookingResponse> getOwnerBookings();

    BookingResponse updateBookingStatus(
            Long bookingId,
            BookingStatus status
    );

    void cancelBooking(Long bookingId);
}