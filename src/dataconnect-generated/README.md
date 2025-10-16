# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPublicCompositions*](#listpubliccompositions)
  - [*ListMyGroups*](#listmygroups)
- [**Mutations**](#mutations)
  - [*CreateMusician*](#createmusician)
  - [*UpdatePracticeSessionNotes*](#updatepracticesessionnotes)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPublicCompositions
You can execute the `ListPublicCompositions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPublicCompositions(): QueryPromise<ListPublicCompositionsData, undefined>;

interface ListPublicCompositionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicCompositionsData, undefined>;
}
export const listPublicCompositionsRef: ListPublicCompositionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPublicCompositions(dc: DataConnect): QueryPromise<ListPublicCompositionsData, undefined>;

interface ListPublicCompositionsRef {
  ...
  (dc: DataConnect): QueryRef<ListPublicCompositionsData, undefined>;
}
export const listPublicCompositionsRef: ListPublicCompositionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPublicCompositionsRef:
```typescript
const name = listPublicCompositionsRef.operationName;
console.log(name);
```

### Variables
The `ListPublicCompositions` query has no variables.
### Return Type
Recall that executing the `ListPublicCompositions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPublicCompositionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPublicCompositionsData {
  compositions: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    fileUrl?: string | null;
    genre?: string | null;
  } & Composition_Key)[];
}
```
### Using `ListPublicCompositions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPublicCompositions } from '@dataconnect/generated';


// Call the `listPublicCompositions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPublicCompositions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPublicCompositions(dataConnect);

console.log(data.compositions);

// Or, you can use the `Promise` API.
listPublicCompositions().then((response) => {
  const data = response.data;
  console.log(data.compositions);
});
```

### Using `ListPublicCompositions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPublicCompositionsRef } from '@dataconnect/generated';


// Call the `listPublicCompositionsRef()` function to get a reference to the query.
const ref = listPublicCompositionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPublicCompositionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.compositions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.compositions);
});
```

## ListMyGroups
You can execute the `ListMyGroups` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyGroups(): QueryPromise<ListMyGroupsData, undefined>;

interface ListMyGroupsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyGroupsData, undefined>;
}
export const listMyGroupsRef: ListMyGroupsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyGroups(dc: DataConnect): QueryPromise<ListMyGroupsData, undefined>;

interface ListMyGroupsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyGroupsData, undefined>;
}
export const listMyGroupsRef: ListMyGroupsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyGroupsRef:
```typescript
const name = listMyGroupsRef.operationName;
console.log(name);
```

### Variables
The `ListMyGroups` query has no variables.
### Return Type
Recall that executing the `ListMyGroups` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyGroupsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyGroupsData {
  groups: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    isPublic?: boolean | null;
  } & Group_Key)[];
}
```
### Using `ListMyGroups`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyGroups } from '@dataconnect/generated';


// Call the `listMyGroups()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyGroups();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyGroups(dataConnect);

console.log(data.groups);

// Or, you can use the `Promise` API.
listMyGroups().then((response) => {
  const data = response.data;
  console.log(data.groups);
});
```

### Using `ListMyGroups`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyGroupsRef } from '@dataconnect/generated';


// Call the `listMyGroupsRef()` function to get a reference to the query.
const ref = listMyGroupsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyGroupsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.groups);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.groups);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateMusician
You can execute the `CreateMusician` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createMusician(): MutationPromise<CreateMusicianData, undefined>;

interface CreateMusicianRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateMusicianData, undefined>;
}
export const createMusicianRef: CreateMusicianRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMusician(dc: DataConnect): MutationPromise<CreateMusicianData, undefined>;

interface CreateMusicianRef {
  ...
  (dc: DataConnect): MutationRef<CreateMusicianData, undefined>;
}
export const createMusicianRef: CreateMusicianRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMusicianRef:
```typescript
const name = createMusicianRef.operationName;
console.log(name);
```

### Variables
The `CreateMusician` mutation has no variables.
### Return Type
Recall that executing the `CreateMusician` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMusicianData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMusicianData {
  musician_insert: Musician_Key;
}
```
### Using `CreateMusician`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMusician } from '@dataconnect/generated';


// Call the `createMusician()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMusician();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMusician(dataConnect);

console.log(data.musician_insert);

// Or, you can use the `Promise` API.
createMusician().then((response) => {
  const data = response.data;
  console.log(data.musician_insert);
});
```

### Using `CreateMusician`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMusicianRef } from '@dataconnect/generated';


// Call the `createMusicianRef()` function to get a reference to the mutation.
const ref = createMusicianRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMusicianRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.musician_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.musician_insert);
});
```

## UpdatePracticeSessionNotes
You can execute the `UpdatePracticeSessionNotes` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePracticeSessionNotes(vars: UpdatePracticeSessionNotesVariables): MutationPromise<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;

interface UpdatePracticeSessionNotesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePracticeSessionNotesVariables): MutationRef<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;
}
export const updatePracticeSessionNotesRef: UpdatePracticeSessionNotesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePracticeSessionNotes(dc: DataConnect, vars: UpdatePracticeSessionNotesVariables): MutationPromise<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;

interface UpdatePracticeSessionNotesRef {
  ...
  (dc: DataConnect, vars: UpdatePracticeSessionNotesVariables): MutationRef<UpdatePracticeSessionNotesData, UpdatePracticeSessionNotesVariables>;
}
export const updatePracticeSessionNotesRef: UpdatePracticeSessionNotesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePracticeSessionNotesRef:
```typescript
const name = updatePracticeSessionNotesRef.operationName;
console.log(name);
```

### Variables
The `UpdatePracticeSessionNotes` mutation requires an argument of type `UpdatePracticeSessionNotesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePracticeSessionNotesVariables {
  id: UUIDString;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePracticeSessionNotes` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePracticeSessionNotesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePracticeSessionNotesData {
  practiceSession_update?: PracticeSession_Key | null;
}
```
### Using `UpdatePracticeSessionNotes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePracticeSessionNotes, UpdatePracticeSessionNotesVariables } from '@dataconnect/generated';

// The `UpdatePracticeSessionNotes` mutation requires an argument of type `UpdatePracticeSessionNotesVariables`:
const updatePracticeSessionNotesVars: UpdatePracticeSessionNotesVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `updatePracticeSessionNotes()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePracticeSessionNotes(updatePracticeSessionNotesVars);
// Variables can be defined inline as well.
const { data } = await updatePracticeSessionNotes({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePracticeSessionNotes(dataConnect, updatePracticeSessionNotesVars);

console.log(data.practiceSession_update);

// Or, you can use the `Promise` API.
updatePracticeSessionNotes(updatePracticeSessionNotesVars).then((response) => {
  const data = response.data;
  console.log(data.practiceSession_update);
});
```

### Using `UpdatePracticeSessionNotes`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePracticeSessionNotesRef, UpdatePracticeSessionNotesVariables } from '@dataconnect/generated';

// The `UpdatePracticeSessionNotes` mutation requires an argument of type `UpdatePracticeSessionNotesVariables`:
const updatePracticeSessionNotesVars: UpdatePracticeSessionNotesVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `updatePracticeSessionNotesRef()` function to get a reference to the mutation.
const ref = updatePracticeSessionNotesRef(updatePracticeSessionNotesVars);
// Variables can be defined inline as well.
const ref = updatePracticeSessionNotesRef({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePracticeSessionNotesRef(dataConnect, updatePracticeSessionNotesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.practiceSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.practiceSession_update);
});
```

