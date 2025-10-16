import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'em-estudio',
  location: 'us-central1'
};

export const createMusicianRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMusician');
}
createMusicianRef.operationName = 'CreateMusician';

export function createMusician(dc) {
  return executeMutation(createMusicianRef(dc));
}

export const listPublicCompositionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicCompositions');
}
listPublicCompositionsRef.operationName = 'ListPublicCompositions';

export function listPublicCompositions(dc) {
  return executeQuery(listPublicCompositionsRef(dc));
}

export const updatePracticeSessionNotesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePracticeSessionNotes', inputVars);
}
updatePracticeSessionNotesRef.operationName = 'UpdatePracticeSessionNotes';

export function updatePracticeSessionNotes(dcOrVars, vars) {
  return executeMutation(updatePracticeSessionNotesRef(dcOrVars, vars));
}

export const listMyGroupsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyGroups');
}
listMyGroupsRef.operationName = 'ListMyGroups';

export function listMyGroups(dc) {
  return executeQuery(listMyGroupsRef(dc));
}

