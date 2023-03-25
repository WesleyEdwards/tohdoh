import { ScheduleType, SpeciesType } from "./apiTypes";

type DateTime = string;

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type Reptile = {
  id: number;
  userId: number;
  species: SpeciesType;
  name: string;
  sex: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  feeding: Feeding[];
  husbandryRecord: HusbandryRecord[];
  schedule: Schedule[];
};
export type Feeding = {
  id: number;
  reptile: Reptile;
  reptileId: number;
  foodItem: string;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type HusbandryRecord = {
  id: number;
  reptile: Reptile;
  reptileId: number;
  length: number;
  weight: number;
  temperature: number;
  humidity: number;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type Schedule = {
  id: number;
  reptileId: number;
  userId: number;
  type: ScheduleType;
  description: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  createdAt?: DateTime;
  updatedAt?: DateTime;
};
