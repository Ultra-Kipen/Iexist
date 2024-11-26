import jwt from 'jsonwebtoken';

const JWT_SECRET = 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded Token:', decoded);
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Invalid token:', error.message);
    } else {
      console.error('Invalid token:', error);
    }
    return null;
  }
};
