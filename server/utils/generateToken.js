const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || "fallback_secret_key";
  const expiresIn = "7d";

  console.log("=== generateToken DEBUG ===");
  console.log("userId:", userId);
  console.log("role:", role);
  console.log("secret type:", typeof secret);
  console.log("secret value:", secret);
  console.log("expiresIn:", expiresIn);
  console.log("jwt version:", require("jsonwebtoken/package.json").version);

  try {
    const token = jwt.sign({ id: userId, role }, secret, { expiresIn });
    console.log("token generated successfully");
    return token;
  } catch (err) {
    console.error("jwt.sign ERROR:", err.message);
    console.error("full error:", err);
    throw err;
  }
};

module.exports = generateToken;
