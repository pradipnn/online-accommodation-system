import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

function SearchBar() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSearchData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchData.location.trim()) {
      toast.warning("Please enter a city or location.");
      return;
    }

    const params = new URLSearchParams({ city: searchData.location.trim() });
    if (searchData.checkIn) params.set("moveIn", searchData.checkIn);
    if (searchData.checkOut) params.set("moveOut", searchData.checkOut);
    if (searchData.guests) params.set("minCapacity", searchData.guests);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form className="premium-search-box" onSubmit={handleSearch}>
      <div className="search-field">
        <div className="search-icon">
          <FaMapMarkerAlt />
        </div>

        <div className="search-input-group">
          <label htmlFor="location">Location</label>

          <input
            id="location"
            type="text"
            name="location"
            placeholder="Enter city or area"
            value={searchData.location}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="search-divider" />

      <div className="search-field">
        <div className="search-icon">
          <FaCalendarAlt />
        </div>

        <div className="search-input-group">
          <label htmlFor="checkIn">Check-in</label>

          <input
            id="checkIn"
            type="date"
            name="checkIn"
            value={searchData.checkIn}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="search-divider" />

      <div className="search-field">
        <div className="search-icon">
          <FaCalendarAlt />
        </div>

        <div className="search-input-group">
          <label htmlFor="checkOut">Check-out</label>

          <input
            id="checkOut"
            type="date"
            name="checkOut"
            value={searchData.checkOut}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="search-divider" />

      <div className="search-field">
        <div className="search-icon">
          <FaUsers />
        </div>

        <div className="search-input-group">
          <label htmlFor="guests">Guests</label>

          <select
            id="guests"
            name="guests"
            value={searchData.guests}
            onChange={handleChange}
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4+ Guests</option>
          </select>
        </div>
      </div>

      <button className="btn search-button" type="submit">
        <FaSearch />
        Search
      </button>
    </form>
  );
}

export default SearchBar;