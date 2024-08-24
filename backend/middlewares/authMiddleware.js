const jwt = require("jsonwebtoken");

// Middleware to authenticate a JWT token
function authenticateToken(req, res, next) {
  // Retrieve the authorization header and extract the token
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided, respond with a 401 Unauthorized status
  if (token == null) return res.sendStatus(401);

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // If the token is invalid or expired, respond with a 403 Forbidden status
    if (err) return res.sendStatus(403);

    // Attach the decoded user information to the request object
    req.user = user;
    
    // Call the next middleware or route handler
    next();
  });
}

// Middleware to check if the authenticated user has admin privileges
function checkAdminRole(req, res, next) {
  // Retrieve the authorization header and extract the token
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided, respond with a 401 Unauthorized status
  if (token == null) return res.sendStatus(401);

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // If the token is invalid or expired, respond with a 403 Forbidden status
    if (err) return res.sendStatus(403);

    // Attach the decoded user information to the request object
    req.user = user;

    // Check if the user has admin privileges
    if (user.is_admin == false) {
      // If the user is not an admin, respond with a 403 Forbidden status
      return res.sendStatus(403);
    }

    // Call the next middleware or route handler
    next();
  });
}

// Export the middleware functions for use in other parts of the application
module.exports.checkAdminRole = checkAdminRole;
module.exports.authenticateToken = authenticateToken;
