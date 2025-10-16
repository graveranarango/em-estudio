import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Composition_Key {
  id: UUIDString;
  __typename?: 'Composition_Key';
}

export interface CreateMusicianData {
  musician_insert: Musician_Key;
}

export interface GroupMember_Key {
  musicianId: UUIDString;
  groupId: UUIDString;
  __typename?: 'GroupMember_Key';
}

export interface Group_Key {
  id: UUIDString;
  __typename?: 'Group_Key';
}

export interface ListMyGroupsData {
  groups: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    isPublic?: boolean | null;
  } & Group_Key)[];
}

export interface ListPublicCompositionsData {
  compositions: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    fileUrl?: string | null;
    genre?: string | null;
  } & Composition_Key)[];
}

export interface Musician_Key {
  id: UUIDString;
  __typename?: 'Musician_Key';
}

export interface PracticeSession_Key {
  id: UUIDString;
  __typename?: 'PracticeSession_Key';
}

export interface UpdatePracticeSessionNotesData {
  practiceSession_update?: PracticeSession_Key | null;
}

export interface UpdatePracticeSessionNotesVariables {
  id: UUIDString;
  notes?: string | null;
}

interface CreateMusicianRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateMusicianData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateMusicianData, undefined>;
  operationName: string;
}
export const createMusicianRef: CreateMusicianRef;

export function createMusician(): MutationPromise<CreateMusicianData, undefined>;
export function createMusician(dc: DataConnect): MutationPromise<CreateMusicianData, undefined>;

interface ListPublicCompositionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicCompositionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPublicCompositionsData, undefined>;
  operationName: string;
}
export const listPublicCompositionsRef: ListPublicCompositionsRef;

export function listPublicCompositions(): QueryPromise<ListPublicCompositionsData, undefined>;
export function listPublicCompositions(dc: DataConnect): QueryPromise<ListPublicCompositionsData, undefined>;

interface UpdatePracticeSessionNotesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePracticeSessionNotesVariables): MutationRef<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePracticeSessionNotesVariables): MutationRef<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;
  operationName: string;
}
export const updatePracticeSessionNotesRef: UpdatePracticeSessionNotesRef;

export function updatePracticeSessionNotes(vars: UpdatePracticeSessionNotesVariables): MutationPromise<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;
export function updatePracticeSessionNotes(dc: DataConnect, vars: UpdatePracticeSessionNotesVariables): MutationPromise<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;

interface ListMyGroupsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyGroupsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyGroupsData, undefined>;
  operationName: string;
}
export const listMyGroupsRef: ListMyGroupsRef;

export function listMyGroups(): QueryPromise<ListMyGroupsData, undefined>;
export function listMyGroups(dc: DataConnect): QueryPromise<ListMyGroupsData, undefined>;

