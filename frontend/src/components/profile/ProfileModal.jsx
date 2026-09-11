import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUser, saveUser } from "../../api/storage";

import {
  uploadProfilePicture,
  removeProfilePicture,
  API_URL,
} from "../../services/api";

/* =====================================================
   PROFILE IMAGE URL
===================================================== */

function getProfileImageUrl(profilePicture) {
  if (!profilePicture) {
    return "";
  }

  // Already a complete URL
  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  // Backend returns something like:
  // /uploads/profile-picture.jpg
  //
  // Convert it to:
  // http://localhost:5000/uploads/profile-picture.jpg

  return `${API_URL}${
    profilePicture.startsWith("/") ? "" : "/"
  }${profilePicture}`;
}

/* =====================================================
   PROFILE MODAL
===================================================== */

function ProfileModal({ onClose }) {
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [user, setUser] = useState(() => getUser() || {});

  const [profileImage, setProfileImage] = useState(() => {
    const currentUser = getUser() || {};

    return getProfileImageUrl(
      currentUser.profilePicture
    );
  });

  const name = user?.name || "User";

  const email =
    user?.email || "No email available";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  /* =====================================================
     SELECT PROFILE IMAGE
  ===================================================== */

  const handleImage = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    /* IMAGE TYPE */

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");

      e.target.value = "";

      return;
    }

    /* IMAGE SIZE */

    if (file.size > 3 * 1024 * 1024) {
      alert(
        "Profile picture must be less than 3MB."
      );

      e.target.value = "";

      return;
    }

    try {
      console.log(
        "Uploading profile picture:",
        file.name
      );

      /* =========================================
         UPLOAD TO BACKEND
      ========================================= */

      const data =
        await uploadProfilePicture(file);

      console.log(
        "PROFILE UPLOAD RESPONSE:",
        data
      );

      /* =========================================
         GET IMAGE PATH
      ========================================= */

      const imagePath =
        data?.profilePicture ||
        data?.user?.profilePicture ||
        "";

      if (!imagePath) {
        throw new Error(
          "The server did not return a profile picture."
        );
      }

      console.log(
        "PROFILE IMAGE PATH:",
        imagePath
      );

      /* =========================================
         CONVERT PATH TO FULL URL
      ========================================= */

      const imageUrl =
        getProfileImageUrl(imagePath);

      console.log(
        "PROFILE IMAGE URL:",
        imageUrl
      );

      /* =========================================
         UPDATE USER
      ========================================= */

      const currentUser =
        getUser() || {};

      const updatedUser = {
        ...currentUser,
        profilePicture: imagePath,
      };

      /* SAVE LOCAL USER */

      saveUser(updatedUser);

      /* UPDATE REACT STATE */

      setUser(updatedUser);

      setProfileImage(imageUrl);

      /* =========================================
         TELL OTHER COMPONENTS
      ========================================= */

      window.dispatchEvent(
        new Event(
          "expenso-profile-updated"
        )
      );

    } catch (error) {
      console.error(
        "PROFILE UPLOAD ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to upload profile picture."
      );
    } finally {
      /* Allow same file to be selected again */

      e.target.value = "";
    }
  };

  /* =====================================================
     REMOVE PROFILE IMAGE
  ===================================================== */

  const removeImage = async () => {
    try {
      await removeProfilePicture();

      const currentUser =
        getUser() || {};

      const updatedUser = {
        ...currentUser,
        profilePicture: "",
      };

      /* SAVE */

      saveUser(updatedUser);

      /* UPDATE STATE */

      setUser(updatedUser);

      setProfileImage("");

      /* NOTIFY OTHER COMPONENTS */

      window.dispatchEvent(
        new Event(
          "expenso-profile-updated"
        )
      );

    } catch (error) {
      console.error(
        "REMOVE PROFILE IMAGE ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to remove profile picture."
      );
    }
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const openAccount = () => {
    onClose?.();

    navigate(
      "/account?section=profile"
    );
  };

  const openSecurity = () => {
    onClose?.();

    navigate(
      "/account?section=security"
    );
  };

  const openHelp = () => {
    onClose?.();

    navigate(
      "/account?section=help"
    );
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onClose?.();

    navigate("/login");
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="profile-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* CLOSE */}

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {/* PROFILE TOP */}

        <div className="profile-top">

          <div className="profile-picture-wrapper">

            {profileImage ? (
              <img
                src={profileImage}
                alt={`${name}'s profile`}
                className="profile-picture"
                onError={(e) => {
                  console.error(
                    "PROFILE IMAGE FAILED:",
                    profileImage
                  );

                  e.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <div className="profile-avatar-large">
                {initials || "U"}
              </div>
            )}

            {/* CAMERA */}

            <button
              type="button"
              className="profile-camera"
              onClick={() =>
                fileInput.current?.click()
              }
              aria-label="Change profile picture"
            >
              <i className="fa-solid fa-camera" />
            </button>

            {/* FILE INPUT */}

            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleImage}
            />

          </div>

          <h2>{name}</h2>

          <p>{email}</p>

          {/* REMOVE PHOTO */}

          {profileImage && (
            <button
              type="button"
              className="remove-photo"
              onClick={removeImage}
            >
              Remove photo
            </button>
          )}

          {/* STATUS */}

          <span className="account-badge">
            <i className="fa-solid fa-circle" />
            Active account
          </span>

        </div>

        {/* PROFILE MENU */}

        <div className="profile-menu">

          {/* ACCOUNT */}

          <button
            type="button"
            onClick={openAccount}
          >
            <div>
              <i className="fa-regular fa-user" />
            </div>

            <span>
              Account settings
            </span>

            <i className="fa-solid fa-chevron-right" />
          </button>

          {/* SECURITY */}

          <button
            type="button"
            onClick={openSecurity}
          >
            <div>
              <i className="fa-solid fa-shield-halved" />
            </div>

            <span>
              Security
            </span>

            <i className="fa-solid fa-chevron-right" />
          </button>

          {/* HELP */}

          <button
            type="button"
            onClick={openHelp}
          >
            <div>
              <i className="fa-regular fa-circle-question" />
            </div>

            <span>
              Help & support
            </span>

            <i className="fa-solid fa-chevron-right" />
          </button>

        </div>

        {/* LOGOUT */}

        <button
          type="button"
          className="profile-logout"
          onClick={logout}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" />

          Log out
        </button>

      </div>
    </div>
  );
}

export default ProfileModal;