import * as argon2 from 'argon2';

export const hashData = (data: string | null): Promise<string | null> => {
    if (!data) return null
    return argon2.hash(data)
}