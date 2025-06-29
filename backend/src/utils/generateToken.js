import jwt from "jsonwebtoken"

/**
 * Generates a JWT token for a user
 * @param {string} userId - The user's ID
 * @param {string} [type='auth'] - The type of token ('auth' or 'password_reset')
 * @param {string} [expiresIn='24h'] - Token expiration time
 * @returns {string} JWT token
 */
export const generateToken = (userId, type = "auth", expiresIn = "24h") => {
  return jwt.sign(
    {
      id: userId,
      type,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}
