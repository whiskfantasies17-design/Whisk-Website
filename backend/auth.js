/**
 * Helper to extract active user session from Express request cookie or Authorization header.
 */
function getSessionFromRequest(req) {
  // 1. Try reading cookie
  const sessionCookie = req.cookies?.whisk_session;
  if (sessionCookie) {
    try {
      return JSON.parse(sessionCookie);
    } catch (e) {}
  }

  // 2. Try reading Authorization header (Bearer base64 or JSON token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (e) {
      try {
        return JSON.parse(token);
      } catch (err) {}
    }
  }

  return null;
}

/**
 * Sets session cookie on Express response.
 */
function setSessionCookie(res, session) {
  const jsonStr = JSON.stringify(session);
  
  // Set cookie with appropriate cross-domain security options
  res.cookie("whisk_session", jsonStr, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week in ms
  });
}

/**
 * Clears session cookie on Express response.
 */
function clearSessionCookie(res) {
  res.clearCookie("whisk_session", {
    path: "/",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

module.exports = {
  getSessionFromRequest,
  setSessionCookie,
  clearSessionCookie,
};
