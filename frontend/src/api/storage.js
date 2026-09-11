const USER_KEY = "user";
const TOKEN_KEY = "token";
const THEME_KEY = "expensoTheme";

const CUSTOMERS_PREFIX = "expensoCustomers_";
const SUPPLIERS_PREFIX = "expensoSuppliers_";
const PRODUCTS_PREFIX = "expensoProducts_";
const NOTIFICATIONS_PREFIX = "expensoNotifications_";


/* =====================================================
   GENERIC STORAGE
===================================================== */

function read(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed;
  } catch (error) {
    console.error(
      `Storage read error: ${key}`,
      error
    );

    return fallback;
  }
}


function write(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error(
      `Storage write error: ${key}`,
      error
    );

    return false;
  }
}


/* =====================================================
   ID
===================================================== */

export function createId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2)
  );
}


/* =====================================================
   USER
===================================================== */

export function getUser() {
  try {
    const value =
      localStorage.getItem(USER_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Unable to read user:",
      error
    );

    return null;
  }
}


export function saveUser(user) {
  return write(
    USER_KEY,
    user
  );
}


export function removeUser() {
  localStorage.removeItem(
    USER_KEY
  );
}


/* =====================================================
   TOKEN
===================================================== */

export function getToken() {
  return localStorage.getItem(
    TOKEN_KEY
  );
}


export function saveToken(token) {
  if (!token) {
    return false;
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  return true;
}


export function removeToken() {
  localStorage.removeItem(
    TOKEN_KEY
  );
}


/* =====================================================
   CURRENT USER ID
===================================================== */

function getUserId() {
  const user = getUser();

  if (!user) {
    return null;
  }

  return (
    user.id ||
    user._id ||
    null
  );
}


/* =====================================================
   USER-SPECIFIC STORAGE KEY
===================================================== */

function getUserStorageKey(prefix) {
  const userId =
    getUserId();

  if (!userId) {
    return null;
  }

  return `${prefix}${userId}`;
}


/* =====================================================
   CUSTOMERS
===================================================== */

export function getCustomers() {
  const key =
    getUserStorageKey(
      CUSTOMERS_PREFIX
    );

  if (!key) {
    return [];
  }

  return read(
    key,
    []
  );
}


export function saveCustomers(
  customers
) {
  const key =
    getUserStorageKey(
      CUSTOMERS_PREFIX
    );

  if (!key) {
    return false;
  }

  return write(
    key,
    customers
  );
}


/* =====================================================
   SUPPLIERS
===================================================== */

export function getSuppliers() {
  const key =
    getUserStorageKey(
      SUPPLIERS_PREFIX
    );

  if (!key) {
    return [];
  }

  return read(
    key,
    []
  );
}


export function saveSuppliers(
  suppliers
) {
  const key =
    getUserStorageKey(
      SUPPLIERS_PREFIX
    );

  if (!key) {
    return false;
  }

  return write(
    key,
    suppliers
  );
}


/* =====================================================
   PRODUCTS
===================================================== */

export function getProducts() {
  const key =
    getUserStorageKey(
      PRODUCTS_PREFIX
    );

  if (!key) {
    return [];
  }

  return read(
    key,
    []
  );
}


export function saveProducts(
  products
) {
  const key =
    getUserStorageKey(
      PRODUCTS_PREFIX
    );

  if (!key) {
    return false;
  }

  return write(
    key,
    products
  );
}


/* =====================================================
   NOTIFICATIONS
===================================================== */

export function getNotifications() {
  const key =
    getUserStorageKey(
      NOTIFICATIONS_PREFIX
    );

  if (!key) {
    return [];
  }

  return read(
    key,
    []
  );
}


export function saveNotifications(
  notifications
) {
  const key =
    getUserStorageKey(
      NOTIFICATIONS_PREFIX
    );

  if (!key) {
    return false;
  }

  return write(
    key,
    notifications
  );
}


/* =====================================================
   ADD NOTIFICATION
===================================================== */

export function addNotification({
  title,
  message,
  type = "info",
}) {
  const current =
    getNotifications();

  const notification = {
    id: createId(),

    title:
      title ||
      "Notification",

    message:
      message ||
      "",

    type,

    read: false,

    createdAt:
      new Date().toISOString(),
  };

  const updated = [
    notification,
    ...current,
  ].slice(0, 50);

  saveNotifications(
    updated
  );

  window.dispatchEvent(
    new Event(
      "expenso-notification-added"
    )
  );

  return notification;
}


/* =====================================================
   MARK ONE READ
===================================================== */

export function markNotificationRead(
  notificationId
) {
  const notifications =
    getNotifications();

  const updated =
    notifications.map(
      (notification) => {

        if (
          notification.id !==
          notificationId
        ) {
          return notification;
        }

        return {
          ...notification,
          read: true,
        };
      }
    );

  saveNotifications(
    updated
  );

  window.dispatchEvent(
    new Event(
      "expenso-notification-updated"
    )
  );
}


/* =====================================================
   MARK ALL READ
===================================================== */

export function markAllNotificationsRead() {
  const notifications =
    getNotifications();

  const updated =
    notifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

  saveNotifications(
    updated
  );

  window.dispatchEvent(
    new Event(
      "expenso-notification-updated"
    )
  );
}


/* =====================================================
   CLEAR NOTIFICATIONS
===================================================== */

export function clearNotifications() {
  const key =
    getUserStorageKey(
      NOTIFICATIONS_PREFIX
    );

  if (!key) {
    return false;
  }

  localStorage.removeItem(
    key
  );

  window.dispatchEvent(
    new Event(
      "expenso-notification-updated"
    )
  );

  return true;
}


/* =====================================================
   UNREAD COUNT
===================================================== */

export function getUnreadNotificationCount() {
  return getNotifications()
    .filter(
      (notification) =>
        !notification.read
    ).length;
}


/* =====================================================
   THEME
===================================================== */

export function getTheme() {
  return (
    localStorage.getItem(
      THEME_KEY
    ) || "light"
  );
}


export function saveTheme(
  theme
) {
  localStorage.setItem(
    THEME_KEY,
    theme
  );
}


/* =====================================================
   CLEAN OLD GLOBAL DATA
===================================================== */

export function migrateOldData() {
  const user =
    getUser();

  if (!user) {
    return;
  }

  const userId =
    user.id ||
    user._id;

  if (!userId) {
    return;
  }


  /*
    This moves the old global
    customer/supplier/product
    data into the current user's
    new account-specific storage.
  */

  const migrations = [
    [
      "expensoCustomers",
      CUSTOMERS_PREFIX,
    ],

    [
      "expensoSuppliers",
      SUPPLIERS_PREFIX,
    ],

    [
      "expensoProducts",
      PRODUCTS_PREFIX,
    ],
  ];


  migrations.forEach(
    ([oldKey, prefix]) => {

      const oldValue =
        localStorage.getItem(
          oldKey
        );

      if (!oldValue) {
        return;
      }

      const newKey =
        `${prefix}${userId}`;

      /*
        Don't overwrite data that
        already exists for the account.
      */

      if (
        localStorage.getItem(
          newKey
        )
      ) {
        return;
      }

      try {

        localStorage.setItem(
          newKey,
          oldValue
        );

      } catch (error) {

        console.error(
          "Migration error:",
          error
        );

      }

    }
  );
}