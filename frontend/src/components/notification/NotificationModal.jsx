import {
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} from "../../api/storage";


function NotificationModal({
  notifications = [],
  onClose,
}) {

  const handleRead = (
    notification
  ) => {
    if (!notification.read) {
      markNotificationRead(
        notification.id
      );
    }
  };


  const handleClear =
    () => {
      clearNotifications();
    };


  const getIcon = (
    type
  ) => {

    if (type === "success") {
      return "fa-circle-check";
    }

    if (type === "warning") {
      return "fa-triangle-exclamation";
    }

    if (type === "error") {
      return "fa-circle-xmark";
    }

    return "fa-circle-info";
  };


  const formatTime = (
    date
  ) => {

    if (!date) {
      return "";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "";
    }

    return value.toLocaleString(
      "en-NG",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  };


  return (
    <div
      className="notification-overlay"
      onClick={onClose}
    >

      <div
        className="notification-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="notification-header">

          <div>
            <h3>
              Notifications
            </h3>

            <p>
              Recent account activity
            </p>
          </div>

          <button
            className="notification-close"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" />
          </button>

        </div>


        <div className="notification-actions">

          <button
            type="button"
            onClick={
              markAllNotificationsRead
            }
          >
            Mark all as read
          </button>

          <button
            type="button"
            onClick={
              handleClear
            }
          >
            Clear all
          </button>

        </div>


        <div className="notification-list">

          {notifications.length ===
          0 ? (
            <div className="notification-empty">

              <div>
                <i className="fa-regular fa-bell-slash" />
              </div>

              <h4>
                No notifications
              </h4>

              <p>
                New account activity
                will appear here.
              </p>

            </div>
          ) : (

            notifications.map(
              (notification) => (
                <button
                  key={
                    notification.id
                  }
                  type="button"
                  className={`notification-item ${
                    notification.read
                      ? ""
                      : "unread"
                  }`}
                  onClick={() =>
                    handleRead(
                      notification
                    )
                  }
                >

                  <div
                    className={`notification-icon ${notification.type}`}
                  >
                    <i
                      className={`fa-solid ${getIcon(
                        notification.type
                      )}`}
                    />
                  </div>


                  <div className="notification-content">

                    <strong>
                      {
                        notification.title
                      }
                    </strong>

                    <p>
                      {
                        notification.message
                      }
                    </p>

                    <small>
                      {formatTime(
                        notification.createdAt
                      )}
                    </small>

                  </div>


                  {!notification.read && (
                    <span className="notification-dot" />
                  )}

                </button>
              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

export default NotificationModal;