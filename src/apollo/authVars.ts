
import { makeVar } from '@apollo/client';


export const authTokenVar = makeVar<string | null>(null);