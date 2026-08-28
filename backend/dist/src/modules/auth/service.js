"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.updateProfile = updateProfile;
exports.verifyAccessToken = verifyAccessToken;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const api_error_1 = require("../../utils/api-error");
const accessTokenLifetime = "15m";
const refreshTokenLifetimeMs = 7 * 24 * 60 * 60 * 1000;
function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is required");
    return secret;
}
function publicUser(user) {
    return user;
}
function signAccessToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, role: user.role }, getSecret(), {
        expiresIn: accessTokenLifetime
    });
}
function hashRefreshToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
async function issueTokens(user) {
    const refreshToken = crypto_1.default.randomBytes(48).toString("base64url");
    await database_1.prisma.refreshToken.create({
        data: {
            token: hashRefreshToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + refreshTokenLifetimeMs)
        }
    });
    return { accessToken: signAccessToken(user), refreshToken, user: publicUser(user) };
}
async function login(email, password) {
    const user = await database_1.prisma.user.findFirst({
        where: { email: email.toLowerCase(), isActive: true, deletedAt: null },
        select: { id: true, email: true, password: true, firstName: true, lastName: true, role: true }
    });
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        throw new api_error_1.ApiError(401, "Invalid email or password");
    }
    const { password: _password, ...authUser } = user;
    return issueTokens(authUser);
}
async function refresh(refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await database_1.prisma.refreshToken.findUnique({
        where: { token: tokenHash },
        include: { user: true }
    });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || !stored.user.isActive || stored.user.deletedAt) {
        throw new api_error_1.ApiError(401, "Invalid or expired refresh token");
    }
    await database_1.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const { password: _password, ...user } = stored.user;
    return issueTokens(user);
}
async function logout(refreshToken) {
    await database_1.prisma.refreshToken.updateMany({
        where: { token: hashRefreshToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() }
    });
}
async function updateProfile(userId, data) {
    const firstName = data.firstName?.trim();
    const lastName = data.lastName?.trim();
    if (!firstName || !lastName)
        throw new api_error_1.ApiError(400, "First name and last name are required");
    return database_1.prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });
}
function verifyAccessToken(token) {
    try {
        const payload = jsonwebtoken_1.default.verify(token, getSecret());
        if (typeof payload.sub !== "string" || !payload.email || !payload.role)
            throw new Error("Invalid claims");
        return { id: payload.sub, email: payload.email, firstName: "", lastName: "", role: payload.role };
    }
    catch {
        throw new api_error_1.ApiError(401, "Invalid or expired access token");
    }
}
