const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'em-estudio',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createMusicianRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMusician');
}
createMusicianRef.operationName = 'CreateMusician';
exports.createMusicianRef = createMusicianRef;

exports.createMusician = function createMusician(dc) {
  return executeMutation(createMusicianRef(dc));
};

const listPublicCompositionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicCompositions');
}
listPublicCompositionsRef.operationName = 'ListPublicCompositions';
exports.listPublicCompositionsRef = listPublicCompositionsRef;

exports.listPublicCompositions = function listPublicCompositions(dc) {
  return executeQuery(listPublicCompositionsRef(dc));
};

const updatePracticeSessionNotesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePracticeSessionNotes', inputVars);
}
updatePracticeSessionNotesRef.operationName = 'UpdatePracticeSessionNotes';
exports.updatePracticeSessionNotesRef = updatePracticeSessionNotesRef;

exports.updatePracticeSessionNotes = function updatePracticeSessionNotes(dcOrVars, vars) {
  return executeMutation(updatePracticeSessionNotesRef(dcOrVars, vars));
};

const listMyGroupsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyGroups');
}
listMyGroupsRef.operationName = 'ListMyGroups';
exports.listMyGroupsRef = listMyGroupsRef;

exports.listMyGroups = function listMyGroups(dc) {
  return executeQuery(listMyGroupsRef(dc));
};
