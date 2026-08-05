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
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.Room.RoomRequest;
import com.backend.dto.Room.RoomResponse;
import com.backend.service.RoomService;

@RestController
@RequestMapping("/api")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // Add room to property
    @PostMapping("/properties/{propertyId}/rooms")
    public ResponseEntity<RoomResponse> addRoom(
            @PathVariable Long propertyId,
            @RequestBody RoomRequest request) {

        RoomResponse response =
                roomService.addRoom(propertyId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get all rooms of one property
    @GetMapping("/properties/{propertyId}/rooms")
    public ResponseEntity<List<RoomResponse>> getRoomsByPropertyId(
            @PathVariable Long propertyId) {

        List<RoomResponse> rooms =
                roomService.getRoomsByPropertyId(propertyId);

        return ResponseEntity.ok(rooms);
    }

    // Get room by room id
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(
            @PathVariable Long roomId) {

        RoomResponse response =
                roomService.getRoomById(roomId);

        return ResponseEntity.ok(response);
    }

    // Update room
    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Long roomId,
            @RequestBody RoomRequest request) {

        RoomResponse response =
                roomService.updateRoom(roomId, request);

        return ResponseEntity.ok(response);
    }

    // Delete room
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<String> deleteRoom(
            @PathVariable Long roomId) {

        roomService.deleteRoom(roomId);

        return ResponseEntity.ok("Room deleted successfully");
    }
}