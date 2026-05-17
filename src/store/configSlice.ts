import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConfigState {
  refreshIntervalMs: number;
}

const initialState: ConfigState = {
  refreshIntervalMs: 30_000,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    refreshIntervalChanged(state, action: PayloadAction<number>) {
      state.refreshIntervalMs = action.payload;
    },
  },
});

export const { refreshIntervalChanged } = configSlice.actions;
export default configSlice.reducer;
