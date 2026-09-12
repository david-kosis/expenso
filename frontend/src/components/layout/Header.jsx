import { useEffect, useState } from "react";
import { getUser } from "../../api/storage";
import ProfileModal from "../profile/ProfileModal";
import { API_URL } from "../../services/api";
import "./header.css";

function getProfileImageUrl(profilePicture) {
  if (!profilePicture) return "";

  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  return `${API_URL}${
    profilePicture.startsWith("/") ? "" : "/"
  }${profilePicture}`;
}

function getInitials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";
}

function Header({ search = "", setSearch, onProfileClick }) {
  const [user, setUser] = useState(() => getUser() || {});
  const [profileImage, setProfileImage] = useState(() =>
    getProfileImageUrl(getUser()?.profilePicture)
  );
  const [imageFailed, setImageFailed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const updatedUser = getUser() || {};
      setUser(updatedUser);
      setProfileImage(getProfileImageUrl(updatedUser.profilePicture));
      setImageFailed(false);
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("expenso-profile-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("expenso-profile-updated", refresh);
    };
  }, []);

  const name = user?.name || "User";
  const initials = getInitials(name);

  const handleProfileClick = () => {
    if (typeof onProfileClick === "function") {
      onProfileClick();
    } else {
      setShowProfile(true);
    }
  };

  const handleImageError = () => {
    setImageFailed(true);
  };

  return (
    <>
      <header className="top-header">
        <div className="mobile-brand" aria-label="Expenso">
          <div className="brand-mark">E</div>
          <div className="mobile-brand-copy">
            <strong>Expenso</strong>
            <span>Business Manager</span>
          </div>
        </div>

        <div className="header-search">
          <i className="fa-solid fa-search" />
          <input
            value={search}
            onChange={(e) => setSearch?.(e.target.value)}
            placeholder="Search customers, suppliers..."
            aria-label="Search"
          />
          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch?.("")}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="notification-button"
            aria-label="Notifications"
          >
            <i className="fa-regular fa-bell" />
            <span />
          </button>

          <button
            type="button"
            className="profile-button"
            onClick={handleProfileClick}
            aria-label="Open profile"
          >
            {profileImage && !imageFailed ? (
              <img
                src={profileImage}
                alt={name}
                className="header-profile-image"
                onError={handleImageError}
              />
            ) : (
              <div className="profile-avatar-small" aria-hidden="true">
                {initials}
              </div>
            )}

            <div className="header-user">
              <strong>{name}</strong>
              <span>My account</span>
            </div>

            <i className="fa-solid fa-chevron-down" />
          </button>
        </div>
      </header>

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

export default Header;
