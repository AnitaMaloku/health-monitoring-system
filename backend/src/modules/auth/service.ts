import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../config/database";
import { UserRole } from "../../generated/prisma/enums";
import { ApiError } from "../../utils/api-error";
import { AuthUser } from "./types";

const accessTokenLifetime = "15m";
const refreshTokenLifetimeMs = 7 * 24 * 60 * 60 * 1000;

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is required");
    return secret;
}

function publicUser(user: AuthUser): AuthUser {
    return user;
}

function signAccessToken(user: AuthUser) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, getSecret(), {
        expiresIn: accessTokenLifetime
    });
}

function hashRefreshToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueTokens(user: AuthUser) {
    const refreshToken = crypto.randomBytes(48).toString("base64url");
    await prisma.refreshToken.create({
        data: {
            token: hashRefreshToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + refreshTokenLifetimeMs)
        }
    });

    return { accessToken: signAccessToken(user), refreshToken, user: publicUser(user) };
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase(), isActive: true, deletedAt: null },
        select: { id: true, email: true, password: true, firstName: true, lastName: true, role: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { password: _password, ...authUser } = user;
    return issueTokens(authUser);
}

export async function refresh(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
        where: { token: tokenHash },
        include: { user: true }
    });

    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || !stored.user.isActive || stored.user.deletedAt) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const { password: _password, ...user } = stored.user;
    return issueTokens(user);
}

export async function logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
        where: { token: hashRefreshToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() }
    });
}

export async function updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    const firstName = data.firstName?.trim();
    const lastName = data.lastName?.trim();

    if (!firstName || !lastName) throw new ApiError(400, "First name and last name are required");

    return prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });
}

export function verifyAccessToken(token: string): AuthUser {
    try {
        const payload = jwt.verify(token, getSecret()) as JwtPayload & { email: string; role: UserRole };
        if (typeof payload.sub !== "string" || !payload.email || !payload.role) throw new Error("Invalid claims");
        return { id: payload.sub, email: payload.email, firstName: "", lastName: "", role: payload.role };
    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }
}
