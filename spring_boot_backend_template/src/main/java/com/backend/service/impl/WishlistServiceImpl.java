package com.backend.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.Wishlist.WishlistResponse;
import com.backend.entities.Property;
import com.backend.entities.User;
import com.backend.entities.Wishlist;
import com.backend.repository.PropertyRepository;
import com.backend.repository.UserRepository;
import com.backend.repository.WishlistRepository;
import com.backend.service.WishlistService;

@Service
@Transactional
public class WishlistServiceImpl
        implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public WishlistServiceImpl(
            WishlistRepository wishlistRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.wishlistRepository = wishlistRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @Override
    public WishlistResponse addToWishlist(
            Long propertyId) {

        User user = getCurrentUser();

        Property property =
                propertyRepository.findById(propertyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property not found with id: "
                                                + propertyId));

        boolean exists =
                wishlistRepository
                        .existsByUserIdAndPropertyId(
                                user.getId(),
                                propertyId);

        if (exists) {
            throw new RuntimeException(
                    "Property already exists in wishlist");
        }

        Wishlist wishlist = new Wishlist();

        wishlist.setUser(user);
        wishlist.setProperty(property);

        Wishlist savedWishlist =
                wishlistRepository.save(wishlist);

        return mapToResponse(savedWishlist);
    }

    @Override
    public List<WishlistResponse> getMyWishlist() {

        User user = getCurrentUser();

        List<Wishlist> wishlistItems =
                wishlistRepository.findByUserId(
                        user.getId());

        List<WishlistResponse> responses =
                new ArrayList<>();

        for (Wishlist wishlist : wishlistItems) {
            responses.add(
                    mapToResponse(wishlist));
        }

        return responses;
    }

    @Override
    public void removeFromWishlist(
            Long propertyId) {

        User user = getCurrentUser();

        Wishlist wishlist =
                wishlistRepository
                        .findByUserIdAndPropertyId(
                                user.getId(),
                                propertyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property not found in wishlist"));

        wishlistRepository.delete(wishlist);
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

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));
    }

    private WishlistResponse mapToResponse(
            Wishlist wishlist) {

        Property property =
                wishlist.getProperty();

        WishlistResponse response =
                new WishlistResponse();

        response.setId(
                wishlist.getId());

        response.setPropertyId(
                property.getId());

        response.setPropertyTitle(
                property.getTitle());

        response.setCity(
                property.getCity());

        response.setState(
                property.getState());

        response.setMonthlyRent(
                property.getMonthlyRent());

        if (property.getPropertyType() != null) {
            response.setPropertyType(
                    property.getPropertyType().name());
        }

        /*
         * Get first property image.
         */
        String propertyImageUrl = null;

        if (property.getImageUrls() != null
                && !property.getImageUrls().isEmpty()) {

            propertyImageUrl =
                    property.getImageUrls()
                            .iterator()
                            .next();
        }

        response.setPropertyImageUrl(
                propertyImageUrl);

        response.setCreatedAt(
                wishlist.getCreatedAt());

        return response;
    }
}