import { CreateMusicianData, ListPublicCompositionsData, UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables, ListMyGroupsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateMusician(options?: useDataConnectMutationOptions<CreateMusicianData, FirebaseError, void>): UseDataConnectMutationResult<CreateMusicianData, undefined>;
export function useCreateMusician(dc: DataConnect, options?: useDataConnectMutationOptions<CreateMusicianData, FirebaseError, void>): UseDataConnectMutationResult<CreateMusicianData, undefined>;

export function useListPublicCompositions(options?: useDataConnectQueryOptions<ListPublicCompositionsData>): UseDataConnectQueryResult<ListPublicCompositionsData, undefined>;
export function useListPublicCompositions(dc: DataConnect, options?: useDataConnectQueryOptions<ListPublicCompositionsData>): UseDataConnectQueryResult<ListPublicCompositionsData, undefined>;

export function useUpdatePracticeSessionNotes(options?: useDataConnectMutationOptions<UpdatePracticeSessionNotesData, FirebaseError, UpdatePracticeSessionNotesVariables>): UseDataConnectMutationResult<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;
export function useUpdatePracticeSessionNotes(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePracticeSessionNotesData, FirebaseError, UpdatePracticeSessionNotesVariables>): UseDataConnectMutationResult<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;

export function useListMyGroups(options?: useDataConnectQueryOptions<ListMyGroupsData>): UseDataConnectQueryResult<ListMyGroupsData, undefined>;
export function useListMyGroups(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyGroupsData>): UseDataConnectQueryResult<ListMyGroupsData, undefined>;
