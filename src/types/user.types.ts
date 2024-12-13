import { FlattenMaps, LeanDocument } from 'mongoose';
import { UserDocument } from '../models/user.model';

export type UserJSON = FlattenMaps<LeanDocument<UserDocument>>
