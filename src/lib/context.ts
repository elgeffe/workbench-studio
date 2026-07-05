import { getContext, setContext } from 'svelte';
import { WorkbenchStore } from './store.svelte';

const KEY = Symbol('workbench-store');

/** Create the single app store and expose it to descendants via context. */
export function provideStore(): WorkbenchStore {
  const store = new WorkbenchStore();
  setContext(KEY, store);
  return store;
}

/** Read the app store from any descendant component. */
export function useStore(): WorkbenchStore {
  const store = getContext<WorkbenchStore>(KEY);
  if (!store) throw new Error('WorkbenchStore not found in context — call provideStore() in a parent.');
  return store;
}
