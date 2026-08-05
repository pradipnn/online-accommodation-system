package com.backend.service;

import java.util.List;

import com.backend.dto.Wishlist.WishlistResponse;

public interface WishlistService {

    WishlistResponse addToWishlist(Long propertyId);

    List<WishlistResponse> getMyWishlist();

    void removeFromWishlist(Long propertyId);
}