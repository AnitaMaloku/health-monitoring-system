import { UserRole } from "../../generated/prisma/enums";

export type AuthUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
};

export type AuthRequest = Express.Request & {
    user?: AuthUser;
};
