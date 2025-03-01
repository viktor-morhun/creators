import { configureStore } from '@reduxjs/toolkit';
import web3Reducer from './slices/web3Slice';
import auctionsReducer from './slices/auctionsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    web3: web3Reducer,
    auctions: auctionsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the Redux state to allow non-serializable values
        ignoredActions: ['web3/setProvider', 'web3/setWeb3Instance'],
        ignoredPaths: ['web3.provider', 'web3.web3'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;