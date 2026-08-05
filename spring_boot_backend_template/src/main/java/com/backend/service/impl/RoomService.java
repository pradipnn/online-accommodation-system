package com.backend.service;

import java.util.List;

import com.backend.dto.Room.RoomRequest;
import com.backend.dto.Room.RoomResponse;

public interface RoomService {

    RoomResponse addRoom(Long propertyId, RoomRequest request);

    RoomResponse getRoomById(Long roomId);

    List<RoomResponse> getRoomsByPropertyId(Long propertyId);

    RoomResponse updateRoom(Long roomId, RoomRequest request);

    void deleteRoom(Long roomId);
}