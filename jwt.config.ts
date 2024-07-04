export const jwtConfig = {
  secret: `${process.env.TOKEN_SECRET}`,
  expiresIn: '1d',
};
