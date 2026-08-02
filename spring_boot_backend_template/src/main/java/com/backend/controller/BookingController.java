package com.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.Booking.BookingRequest;
import com.backend.dto.Booking.BookingResponse;
import com.backend.enums.BookingStatus;
import com.backend.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request) {

        BookingResponse response =
                bookingService.createBooking(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    // Logged-in user's bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {

        List<BookingResponse> responses =
                bookingService.getMyBookings();

        return ResponseEntity.ok(responses);
    }

    // Logged-in owner's property bookings
    @GetMapping("/owner")
    public ResponseEntity<List<BookingResponse>> getOwnerBookings() {

        List<BookingResponse> responses =
                bookingService.getOwnerBookings();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long bookingId) {

        BookingResponse response =
                bookingService.getBookingById(bookingId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status) {

        BookingResponse response =
                bookingService.updateBookingStatus(
                        bookingId,
                        status
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long bookingId) {

        bookingService.cancelBooking(bookingId);

        return ResponseEntity.ok(
                "Booking cancelled successfully"
        );
    }
}