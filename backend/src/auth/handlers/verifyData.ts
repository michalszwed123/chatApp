import * as argon2 from 'argon2';

export const verifyData = (hash: string, plain: string): Promise<boolean> => {
    return argon2.verify(hash, plain)
}