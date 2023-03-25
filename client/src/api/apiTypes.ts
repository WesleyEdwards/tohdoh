export type CreateUserBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};
