import { nanoid , customAlphabet } from 'nanoid'

export const generateTag = (): string => {
    const nanoid = customAlphabet('1234567890ABCDFG', 5)
    return '#' + nanoid()
}