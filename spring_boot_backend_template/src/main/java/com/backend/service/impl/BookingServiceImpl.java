package com.backend.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.Booking.BookingRequest;
import com.backend.dto.Booking.BookingResponse;
import com.backend.entities.Booking;
import com.backend.entities.Room;
import com.backend.entities.User;
import com.backend.enums.BookingStatus;
import com.backend.repository.BookingRepository;
import com.backend.repository.RoomRepository;
import com.backend.repository.UserRepository;
import com.backend.service.BookingService;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            UserRepository userRepository) {

        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public BookingResponse createBooking(
            BookingRequest request) {

        validateBookingRequest(request);

        User currentUser = getCurrentUser();

        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Room not found with id: "
                                        + request.getRoomId()));

        if (Boolean.FALSE.equals(room.getAvailable())) {
            throw new RuntimeException(
                    "Room is not available");
        }

        if (room.getAvailableBeds() == null
                || room.getAvailableBeds() <= 0) {

            throw new RuntimeException(
                    "No beds are available in this room");
        }

        int occupants = request.getOccupants();

        if (occupants > room.getAvailableBeds()) {
            throw new RuntimeException(
                    "Only " + room.getAvailableBeds()
                            + " beds are available");
        }

        BigDecimal totalAmount =
                calculateTotalAmount(
                        room,
                        request.getCheckInDate(),
                        request.getCheckOutDate(),
                        occupants);

        Booking booking = new Booking();

        booking.setCheckInDate(
                request.getCheckInDate());

        booking.setCheckOutDate(
                request.getCheckOutDate());

        booking.setOccupants(
                request.getOccupants());

        booking.setMessage(
                request.getMessage());

        booking.setTotalAmount(totalAmount);

        /*
         * Beds are not reduced here.
         * They will be reduced only after owner confirms.
         */
        booking.setStatus(
                BookingStatus.PENDING);

        booking.setUser(currentUser);
        booking.setRoom(room);
        booking.setProperty(room.getProperty());

        Booking savedBooking =
                bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    @Override
    public BookingResponse getBookingById(
            Long bookingId) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId));

        return mapToResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings() {

        User currentUser = getCurrentUser();

        List<Booking> bookings =
                bookingRepository.findByUserId(
                        currentUser.getId());

        List<BookingResponse> responses =
                new ArrayList<>();

        for (Booking booking : bookings) {
            responses.add(
                    mapToResponse(booking));
        }

        return responses;
    }

    @Override
    public List<BookingResponse> getOwnerBookings() {

        User currentOwner = getCurrentUser();

        List<Booking> bookings =
                bookingRepository
                        .findBookingsByOwnerId(
                                currentOwner.getId());

        List<BookingResponse> responses =
                new ArrayList<>();

        for (Booking booking : bookings) {
            responses.add(
                    mapToResponse(booking));
        }

        return responses;
    }

    @Override
    public BookingResponse updateBookingStatus(
            Long bookingId,
            BookingStatus newStatus) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId));

        if (newStatus == null) {
            throw new RuntimeException(
                    "Booking status is required");
        }

        BookingStatus oldStatus =
                booking.getStatus();

        /*
         * Same status पुन्हा select केला तर
         * beds पुन्हा कमी किंवा जास्त होणार नाहीत.
         */
        if (oldStatus == newStatus) {
            return mapToResponse(booking);
        }

        /*
         * Owner confirms booking:
         * available beds decrease.
         */
        if (newStatus == BookingStatus.CONFIRMED) {

            if (oldStatus != BookingStatus.PENDING) {
                throw new RuntimeException(
                        "Only pending booking can be confirmed");
            }

            reserveBeds(booking);
        }

        /*
         * Confirmed booking cancelled/rejected:
         * available beds increase again.
         */
        if ((newStatus == BookingStatus.CANCELLED
                || newStatus == BookingStatus.REJECTED)
                && oldStatus == BookingStatus.CONFIRMED) {

            releaseBeds(booking);
        }

        booking.setStatus(newStatus);

        Booking updatedBooking =
                bookingRepository.save(booking);

        return mapToResponse(updatedBooking);
    }

    @Override
    public void cancelBooking(Long bookingId) {

        User currentUser = getCurrentUser();

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + bookingId));

        if (!booking.getUser()
                .getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You cannot cancel another user's booking");
        }

        if (booking.getStatus()
                == BookingStatus.CANCELLED) {

            throw new RuntimeException(
                    "Booking is already cancelled");
        }

        /*
         * Booking confirmed असेल तर
         * cancelled करताना beds परत add करा.
         */
        if (booking.getStatus()
                == BookingStatus.CONFIRMED) {

            releaseBeds(booking);
        }

        booking.setStatus(
                BookingStatus.CANCELLED);

        bookingRepository.save(booking);
    }

    private void reserveBeds(Booking booking) {

        Room room = roomRepository.findById(booking.getRoom().getId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        int occupants = booking.getOccupants() == null ? 1 : booking.getOccupants();
        int availableBeds = room.getAvailableBeds() == null ? 0 : room.getAvailableBeds();

        if (availableBeds < occupants) {
            throw new RuntimeException("Only " + availableBeds + " beds available. Cannot confirm booking for " + occupants + " occupants.");
        }

        int remainingBeds = availableBeds - occupants;
        room.setAvailableBeds(remainingBeds);
        room.setAvailable(remainingBeds > 0);

        roomRepository.save(room);
    }

    private void releaseBeds(Booking booking) {

        Room room = roomRepository.findById(booking.getRoom().getId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        int occupants = booking.getOccupants() == null ? 1 : booking.getOccupants();
        int currentAvailableBeds = room.getAvailableBeds() == null ? 0 : room.getAvailableBeds();
        int capacity = room.getCapacity() == null ? currentAvailableBeds + occupants : room.getCapacity();

        int restoredBeds = currentAvailableBeds + occupants;
        if (restoredBeds > capacity) {
            restoredBeds = capacity;
        }

        room.setAvailableBeds(restoredBeds);
        room.setAvailable(restoredBeds > 0);

        roomRepository.save(room);
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: "
                                        + email));
    }

    private void validateBookingRequest(
            BookingRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Booking request is required");
        }

        if (request.getRoomId() == null) {
            throw new RuntimeException(
                    "Room id is required");
        }

        if (request.getCheckInDate() == null) {
            throw new RuntimeException(
                    "Check-in date is required");
        }

        if (request.getCheckOutDate() == null) {
            throw new RuntimeException(
                    "Check-out date is required");
        }

        if (request.getOccupants() == null
                || request.getOccupants() < 1) {

            throw new RuntimeException(
                    "Occupants must be at least 1");
        }

        if (request.getCheckInDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Check-in date cannot be in the past");
        }

        if (!request.getCheckOutDate()
                .isAfter(request.getCheckInDate())) {

            throw new RuntimeException(
                    "Check-out date must be after check-in date");
        }
    }

    private BigDecimal calculateTotalAmount(
            Room room,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            int occupants) {

        long numberOfDays =
                ChronoUnit.DAYS.between(
                        checkInDate,
                        checkOutDate);

        BigDecimal monthlyRent =
                room.getMonthlyRent();

        BigDecimal dailyRent =
                monthlyRent.divide(
                        BigDecimal.valueOf(30),
                        2,
                        RoundingMode.HALF_UP);

        /*
         * Monthly rent हा per-bed rent आहे असे धरून
         * occupants ने multiply केले आहे.
         */
        return dailyRent
                .multiply(
                        BigDecimal.valueOf(numberOfDays))
                .multiply(
                        BigDecimal.valueOf(occupants))
                .setScale(
                        2,
                        RoundingMode.HALF_UP);
    }

    private BookingResponse mapToResponse(
            Booking booking) {

        BookingResponse response =
                new BookingResponse();

        response.setId(
                booking.getId());

        response.setCheckInDate(
                booking.getCheckInDate());

        response.setCheckOutDate(
                booking.getCheckOutDate());

        response.setOccupants(
                booking.getOccupants());

        response.setMessage(
                booking.getMessage());

        response.setTotalAmount(
                booking.getTotalAmount());

        response.setStatus(
                booking.getStatus());

        response.setCreatedAt(
                booking.getCreatedAt());

        response.setUpdatedAt(
                booking.getUpdatedAt());

        if (booking.getUser() != null) {
            response.setUserId(
                    booking.getUser().getId());
        }

        if (booking.getProperty() != null) {

            response.setPropertyId(
                    booking.getProperty().getId());

            response.setPropertyTitle(
                    booking.getProperty().getTitle());
        }

        if (booking.getRoom() != null) {

            Room room = booking.getRoom();

            response.setRoomId(
                    room.getId());

            response.setRoomNumber(
                    room.getRoomNumber());
        }

        return response;
    }
}