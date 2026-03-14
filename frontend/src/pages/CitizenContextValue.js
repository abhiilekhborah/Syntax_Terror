import { createContext } from 'react';

/** @type {React.Context<import('./CitizenContext').CitizenContextValue | null>} */
export const CitizenContext = createContext(null);
CitizenContext.displayName = 'CitizenContext';