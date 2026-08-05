package com.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.dto.Wishlist.WishlistResponse;
import com.backend.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/{propertyId}")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @PathVariable Long propertyId) {

        WishlistResponse response =
                wishlistService.addToWishlist(propertyId);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getMyWishlist() {

        List<WishlistResponse> response =
                wishlistService.getMyWishlist();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<String> removeFromWishlist(
            @PathVariable Long propertyId) {

        wishlistService.removeFromWishlist(propertyId);

        return ResponseEntity.ok(
                "Property removed from wishlist successfully");
    }
}