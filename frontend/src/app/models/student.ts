import { Delete } from "../utils/util.model";

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
    programmeId: string;
    photo: string;
    isDeleted: Delete;
}
