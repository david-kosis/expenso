const jwt = require("jsonwebtoken");

function parseCookies(header = "") {
  return header.split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index === -1) return cookies;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
    return cookies;
  }, {});
}

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const cookies = parseCookies(req.headers.cookie || "");
    const token =
      cookies.expenso_session ||
      (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader);

    if (!token) return res.status(401).json({ message: "Authentication required" });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Server configuration error" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "expenso",
      audience: "expenso-web",
    });

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = authenticateToken;
