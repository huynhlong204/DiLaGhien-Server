export interface AuthenticatedUser {
    user_id: number;
    email: string;
    role_id: number;
    company_id: number | null;
    role: {
        name: string;
    };
}
