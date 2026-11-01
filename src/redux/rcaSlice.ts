import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Investigation, CapaItem, DashboardMetrics, EvidenceGap, FiveWhyItem, RootCause } from '../types';
import * as api from '../services/api';

interface RcaState {
  investigations: Investigation[];
  activeInvestigation: Investigation | null;
  capas: CapaItem[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  aiProcessingStage: number; // 0=Idle, 1=Reading, 2=Extracting, 3=Validating, 4=Preparing, 5=Complete
  error: string | null;
  searchQuery: string;
  filters: {
    status: string;
    severity: string;
    department: string;
  };
  backendStatus: {
    online: boolean;
    groqConfigured: boolean;
    databaseConnected: boolean;
  };
}

const initialState: RcaState = {
  investigations: [],
  activeInvestigation: null,
  capas: [],
  metrics: null,
  loading: false,
  aiProcessingStage: 0,
  error: null,
  searchQuery: '',
  filters: {
    status: 'ALL',
    severity: 'ALL',
    department: 'ALL'
  },
  backendStatus: {
    online: true,
    groqConfigured: false,
    databaseConnected: true
  }
};

export const loadInvestigations = createAsyncThunk('rca/loadInvestigations', async () => {
  return await api.fetchInvestigations();
});

export const loadCapas = createAsyncThunk('rca/loadCapas', async () => {
  return await api.fetchCapas();
});

export const loadMetrics = createAsyncThunk('rca/loadMetrics', async () => {
  return await api.fetchDashboardMetrics();
});

export const checkHealth = createAsyncThunk('rca/checkHealth', async () => {
  return await api.checkBackendHealth();
});

export const fetchInvestigationById = createAsyncThunk('rca/fetchInvestigationById', async (id: string) => {
  return await api.fetchInvestigationById(id);
});

export const saveInvestigationThunk = createAsyncThunk('rca/saveInvestigation', async (inv: Partial<Investigation>) => {
  return await api.saveInvestigation(inv);
});

export const deleteInvestigationThunk = createAsyncThunk('rca/deleteInvestigation', async (id: string) => {
  await api.deleteInvestigationApi(id);
  return id;
});

export const saveCapaThunk = createAsyncThunk('rca/saveCapa', async (capa: Partial<CapaItem>) => {
  return await api.saveCapa(capa);
});

export const deleteCapaThunk = createAsyncThunk('rca/deleteCapa', async (id: string) => {
  await api.deleteCapaApi(id);
  return id;
});

const rcaSlice = createSlice({
  name: 'rca',
  initialState,
  reducers: {
    setActiveInvestigation: (state, action: PayloadAction<Investigation | null>) => {
      state.activeInvestigation = action.payload;
    },
    setAiProcessingStage: (state, action: PayloadAction<number>) => {
      state.aiProcessingStage = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<RcaState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateExtractedField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      if (state.activeInvestigation && state.activeInvestigation.extracted_data) {
        (state.activeInvestigation.extracted_data as any)[action.payload.field] = action.payload.value;
        (state.activeInvestigation as any)[action.payload.field] = action.payload.value;
      }
    },
    updateFiveWhyStep: (state, action: PayloadAction<{ index: number; updates: Partial<FiveWhyItem> }>) => {
      if (state.activeInvestigation && state.activeInvestigation.five_whys) {
        state.activeInvestigation.five_whys[action.payload.index] = {
          ...state.activeInvestigation.five_whys[action.payload.index],
          ...action.payload.updates
        };
      }
    },
    updateRootCauseStatus: (state, action: PayloadAction<{ id: string; status: any }>) => {
      if (state.activeInvestigation && state.activeInvestigation.root_causes) {
        const rc = state.activeInvestigation.root_causes.find(r => r.id === action.payload.id);
        if (rc) rc.status = action.payload.status;
      }
    },
    updateEvidenceGapStatus: (state, action: PayloadAction<{ id: string; status: any }>) => {
      if (state.activeInvestigation && state.activeInvestigation.evidence_gaps) {
        const eg = state.activeInvestigation.evidence_gaps.find(e => e.id === action.payload.id);
        if (eg) eg.status = action.payload.status;
      }
    },
    addCapaToActive: (state, action: PayloadAction<CapaItem>) => {
      if (state.activeInvestigation) {
        state.activeInvestigation.capas = [...(state.activeInvestigation.capas || []), action.payload];
      }
      state.capas.unshift(action.payload);
    },
    updateCapaInActive: (state, action: PayloadAction<CapaItem>) => {
      if (state.activeInvestigation && state.activeInvestigation.capas) {
        const idx = state.activeInvestigation.capas.findIndex(c => c.id === action.payload.id);
        if (idx >= 0) state.activeInvestigation.capas[idx] = action.payload;
      }
      const cIdx = state.capas.findIndex(c => c.id === action.payload.id);
      if (cIdx >= 0) state.capas[cIdx] = action.payload;
    },
    deleteCapaFromActive: (state, action: PayloadAction<string>) => {
      if (state.activeInvestigation && state.activeInvestigation.capas) {
        state.activeInvestigation.capas = state.activeInvestigation.capas.filter(c => c.id !== action.payload);
      }
      state.capas = state.capas.filter(c => c.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInvestigations.fulfilled, (state, action) => {
        state.investigations = action.payload;
        if (!state.activeInvestigation && action.payload.length > 0) {
          state.activeInvestigation = action.payload[0];
        }
      })
      .addCase(loadCapas.fulfilled, (state, action) => {
        state.capas = action.payload;
      })
      .addCase(loadMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      .addCase(checkHealth.fulfilled, (state, action) => {
        state.backendStatus = {
          online: action.payload.status === 'healthy',
          groqConfigured: !!action.payload.groq_configured,
          databaseConnected: !!action.payload.database_connected
        };
      })
      .addCase(fetchInvestigationById.fulfilled, (state, action) => {
        state.activeInvestigation = action.payload;
      })
      .addCase(saveInvestigationThunk.fulfilled, (state, action) => {
        state.activeInvestigation = action.payload;
        const index = state.investigations.findIndex(i => i.id === action.payload.id || i.deviation_id === action.payload.deviation_id);
        if (index >= 0) {
          state.investigations[index] = action.payload;
        } else {
          state.investigations.unshift(action.payload);
        }
      })
      .addCase(deleteInvestigationThunk.fulfilled, (state, action) => {
        state.investigations = state.investigations.filter(i => i.id !== action.payload);
        if (state.activeInvestigation?.id === action.payload) {
          state.activeInvestigation = state.investigations[0] || null;
        }
      })
      .addCase(saveCapaThunk.fulfilled, (state, action) => {
        const cIdx = state.capas.findIndex(c => c.id === action.payload.id);
        if (cIdx >= 0) {
          state.capas[cIdx] = action.payload;
        } else {
          state.capas.unshift(action.payload);
        }
      })
      .addCase(deleteCapaThunk.fulfilled, (state, action) => {
        state.capas = state.capas.filter(c => c.id !== action.payload);
      });
  }
});

export const {
  setActiveInvestigation,
  setAiProcessingStage,
  setSearchQuery,
  setFilters,
  updateExtractedField,
  updateFiveWhyStep,
  updateRootCauseStatus,
  updateEvidenceGapStatus,
  addCapaToActive,
  updateCapaInActive,
  deleteCapaFromActive
} = rcaSlice.actions;

export default rcaSlice.reducer;
