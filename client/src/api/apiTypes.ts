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

export type CreateEventSchedulerBody = {
  name: string;
  latX: number;
  latY: number;
  duration: number;
  priority: number;
};
