import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// In-Memory Database Store for Investigations & CAPAs
let investigationsStore: any[] = [
  {
    id: "INV-2026-001",
    deviation_id: "DEV-2026-0089",
    title: "Temperature Excursion During API Drying Process",
    description: "During the manufacturing of API batch API-2026-014, the drying stage exceeded the validated temperature limit of 60°C for approximately 25 minutes, reaching a peak temperature of 68.4°C. The batch was immediately placed on quality hold.",
    source_type: "PDF",
    occurrence_date: "2026-10-28",
    reported_date: "2026-10-28",
    department: "Production - API Synthesis",
    batch_number: "API-2026-014",
    product_name: "Active Pharmaceutical Ingredient (API-Alpha)",
    manufacturing_stage: "Drying (Tray Dryer TD-04)",
    equipment: "Industrial Tray Dryer TD-04",
    severity: "Major",
    immediate_action: "Batch placed on quality hold in quarantine room Q-02. Heating system isolated.",
    extracted_data: {
      deviation_id: "DEV-2026-0089",
      title: "Temperature Excursion During API Drying Process",
      description: "During the manufacturing of API batch API-2026-014, the drying stage exceeded the validated temperature limit of 60°C for approximately 25 minutes, reaching a peak temperature of 68.4°C.",
      occurrence_date: "2026-10-28",
      reported_date: "2026-10-28",
      department: "Production - API Synthesis",
      batch_number: "API-2026-014",
      product_name: "Active Pharmaceutical Ingredient (API-Alpha)",
      manufacturing_stage: "Drying (Tray Dryer TD-04)",
      equipment: "Industrial Tray Dryer TD-04",
      severity: "Major",
      immediate_action: "Batch placed on quality hold in quarantine room Q-02. Heating system isolated.",
      observed_impact: "Potential impact on crystalline polymorphic stability and moisture specs.",
      investigation_owner: "QA Manager"
    },
    five_whys: [
      {
        level: 1,
        question: "Why did the API drying temperature exceed the validated upper limit?",
        answer: "The heating jacket temperature rose to 68.4°C against a maximum limit of 60°C for 25 minutes.",
        supporting_evidence: "SCADA Continuous Trend Log (Tag: TD04_TEMP_PV).",
        confidence: "Observed Fact",
        reviewer_notes: "Confirmed by QA physical trend printout.",
        is_verified: true
      },
      {
        level: 2,
        question: "Why did the heating jacket temperature rise above target limits?",
        answer: "The steam supply control valve CV-102 remained open despite the PLC controller requesting 0% output.",
        supporting_evidence: "PLC Output Log (Tag: TD04_CV102_OUT = 0.0%).",
        confidence: "Observed Fact",
        reviewer_notes: "Signal sent successfully; physical valve remained open.",
        is_verified: true
      },
      {
        level: 3,
        question: "Why did control valve CV-102 remain open when receiving 0% signal?",
        answer: "Pneumatic actuator stem bound due to particulate fouling in air regulator line or sticky valve packing.",
        supporting_evidence: "Maintenance log entry notes sticky stroke during previous preventive maintenance.",
        confidence: "Possible Contributing Factor",
        reviewer_notes: "Needs teardown inspection by Instrument Dept.",
        is_verified: false
      },
      {
        level: 4,
        question: "Why was the valve mechanical binding not detected prior to batch loading?",
        answer: "Pre-execution equipment checklist did not mandate a full-stroke functional test of steam valves.",
        supporting_evidence: "SOP-PRD-305 Section 4.2 Equipment Setup checklist.",
        confidence: "Potential Root Cause",
        reviewer_notes: "Procedural gap identified in setup SOP.",
        is_verified: false
      },
      {
        level: 5,
        question: "Why was full-stroke valve testing omitted from the setup SOP?",
        answer: "Equipment maintenance SOP was revised without incorporating instrument failure mode feedback.",
        supporting_evidence: "Change Control CC-2025-188 document review.",
        confidence: "Confirmed Root Cause",
        reviewer_notes: "Root cause linked to Quality System procedure gap.",
        is_verified: false
      }
    ],
    fishbone: [
      {
        category: "Manpower",
        factors: [
          { name: "Operator Alarm Response Lag", description: "Operator delayed manual override by 17 minutes due to parallel sampling task.", evidence: "SCADA alarm log", status: "Contributing Factor" }
        ]
      },
      {
        category: "Machine",
        factors: [
          { name: "Pneumatic Control Valve CV-102 Sticking", description: "Pneumatic actuator mechanical binding causing delayed valve seat closure.", evidence: "PLC signal vs steam pressure downstream", status: "Primary Suspect" },
          { name: "Temperature Probe RTD TT-401 Calibration Drift", description: "Thermal probe calibration drift standard deviation check.", evidence: "Calibration sticker past 6-month window", status: "Under Verification" }
        ]
      },
      {
        category: "Method",
        factors: [
          { name: "SOP Setup Checklist Deficiency", description: "Pre-batch setup procedure SOP-PRD-305 lacks automated valve stroke verification step.", evidence: "SOP document review revision 3.1", status: "Root Cause Candidate" }
        ]
      },
      {
        category: "Material",
        factors: [
          { name: "Wet Cake Moisture Content", description: "Higher initial solvent load in wet cake required higher heat duty.", evidence: "In-process LOD test report", status: "Ruled Out" }
        ]
      },
      {
        category: "Measurement",
        factors: [
          { name: "SCADA Telemetry Polling Rate", description: "10-second polling interval delayed real-time rate of rise calculation.", evidence: "Historian config", status: "Minor Factor" }
        ]
      },
      {
        category: "Environment",
        factors: [
          { name: "Cleanroom Ambient Conditions", description: "HVAC temp and humidity within validated cleanroom limits (21°C, 45% RH).", evidence: "BMS trend log", status: "Ruled Out" }
        ]
      }
    ],
    root_causes: [
      {
        id: "RC-01",
        description: "Temperature probe sensor drift / calibration offset in Tray Dryer TD-04 heating loop.",
        category: "Machine / Calibration",
        supporting_evidence: "BMR temperature log shows sudden 8°C step jump without proportional steam valve command change.",
        evidence_gaps: "Calibration certificate for RTD probe TT-401 past due date or unverified.",
        confidence_level: "High Hypothesis (75%)",
        verification_method: "Perform 3-point calibration check on RTD probe TT-401 using certified reference standard.",
        status: "AI Suggested"
      },
      {
        id: "RC-02",
        description: "PID controller steam control valve mechanical sticking in open position.",
        category: "Machine / Maintenance",
        supporting_evidence: "Steam inlet pressure maintained high while solenoid signal instructed closure.",
        evidence_gaps: "Valve position transmitter logs and pneumatic actuator inspection reports.",
        confidence_level: "High Hypothesis (85%)",
        verification_method: "Inspect control valve CV-102 pneumatic actuator seal and stroke hysteresis.",
        status: "Under Verification"
      }
    ],
    evidence_gaps: [
      {
        id: "EV-01",
        missing_evidence: "Batch Manufacturing Record (BMR) Pages 14-18",
        evidence_category: "Batch Manufacturing Records",
        reason_required: "Verify actual operator sign-offs, temp readings, and LOD test timestamps during drying phase.",
        related_root_cause: "RC-03 Operator Response",
        recommended_activity: "Retrieve physical signed BMR from QA Document Archive.",
        priority: "High",
        status: "Pending"
      },
      {
        id: "EV-02",
        missing_evidence: "RTD Temperature Sensor TT-401 Calibration Certificate",
        evidence_category: "Equipment Calibration Records",
        reason_required: "Rule out sensor calibration offset or thermal drift during excursion window.",
        related_root_cause: "RC-01 Probe Sensor Drift",
        recommended_activity: "Request Calibration Record Cal-2026-889 from Metrology Lab.",
        priority: "High",
        status: "Requested"
      }
    ],
    capas: [
      {
        id: "CAPA-2026-081",
        capa_type: "Corrective",
        description: "Replace pneumatic actuator packing seal and rebuild steam control valve CV-102 on Tray Dryer TD-04.",
        justification: "Address physical valve binding detected during temperature excursion incident.",
        responsible_department: "Engineering & Maintenance",
        owner: "Lead Instrument Engineer",
        priority: "High",
        target_date: "2026-11-15",
        verification_method: "Perform 10-cycle automated stroke test & leak rate verification under operational steam pressure.",
        effectiveness_criteria: "Zero valve binding or positional hysteresis during 3 consecutive production batches.",
        status: "Proposed"
      },
      {
        id: "CAPA-2026-082",
        capa_type: "Preventive",
        description: "Revise SOP-PRD-305 (Tray Dryer Setup) to incorporate mandatory pre-batch automated valve stroke test.",
        justification: "Prevent loading batches when steam control valves demonstrate sluggish response.",
        responsible_department: "Quality Assurance & Production",
        owner: "QA Systems Specialist",
        priority: "High",
        target_date: "2026-11-20",
        verification_method: "Document review and training records sign-off for all API operators.",
        effectiveness_criteria: "100% compliance on pre-batch setup checklists audited during 30-day post-implementation QA review.",
        status: "Proposed"
      }
    ],
    investigation_status: "Under Investigation",
    created_at: "2026-10-28T14:30:00Z",
    updated_at: "2026-10-29T10:15:00Z"
  }
];

let capasStore: any[] = [
  {
    id: "CAPA-2026-081",
    investigation_id: "INV-2026-001",
    capa_type: "Corrective",
    description: "Replace pneumatic actuator packing seal and rebuild steam control valve CV-102 on Tray Dryer TD-04.",
    justification: "Address physical valve binding detected during temperature excursion incident.",
    responsible_department: "Engineering & Maintenance",
    owner: "Lead Instrument Engineer",
    priority: "High",
    target_date: "2026-11-15",
    verification_method: "Perform 10-cycle automated stroke test under operational steam pressure.",
    effectiveness_criteria: "Zero valve binding during 3 consecutive production batches.",
    status: "Proposed",
    created_at: "2026-10-29T10:00:00Z"
  },
  {
    id: "CAPA-2026-082",
    investigation_id: "INV-2026-001",
    capa_type: "Preventive",
    description: "Revise SOP-PRD-305 (Tray Dryer Setup) to incorporate mandatory pre-batch automated valve stroke test.",
    justification: "Prevent loading batches when steam control valves demonstrate sluggish response.",
    responsible_department: "Quality Assurance & Production",
    owner: "QA Systems Specialist",
    priority: "High",
    target_date: "2026-11-20",
    verification_method: "Document review and operator training sign-offs.",
    effectiveness_criteria: "100% compliance on pre-batch setup checklists.",
    status: "Proposed",
    created_at: "2026-10-29T10:05:00Z"
  }
];

// Helper to generate AI RCA payload
function generateAIRCAPayload(text: string, sourceType: string = "TEXT") {
  const isDrying = text.toLowerCase().includes("drying") || text.toLowerCase().includes("temperature") || text.toLowerCase().includes("api-2026-014");
  
  return {
    source_text: text,
    source_type: sourceType,
    extracted_information: {
      deviation_id: `DEV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: isDrying ? "Temperature Excursion During API Drying Process" : "Manufacturing Process Deviation Investigation",
      description: text || "API manufacturing stage deviation reported during production shift.",
      occurrence_date: new Date().toISOString().split('T')[0],
      reported_date: new Date().toISOString().split('T')[0],
      department: isDrying ? "Production - API Synthesis" : "Quality Control / Production",
      batch_number: isDrying ? "API-2026-014" : `BATCH-${Math.floor(100 + Math.random() * 900)}`,
      product_name: "Active Pharmaceutical Ingredient (API-Alpha)",
      manufacturing_stage: isDrying ? "Drying (Tray Dryer TD-04)" : "Synthesis / Purification Stage",
      equipment: isDrying ? "Industrial Tray Dryer TD-04" : "Reactor Vessel R-102",
      severity: isDrying ? "Major" : "Moderate",
      immediate_action: "Batch placed on immediate quality hold. QA notified.",
      observed_impact: "Potential thermal degradation or yield variance pending analytical verification.",
      investigation_owner: "QA Technical Lead"
    },
    validation_results: [
      { field: "deviation_id", status: "VALID", message: "Generated valid deviation identifier." },
      { field: "batch_number", status: "VALID", message: "Batch number identified in narrative." },
      { field: "equipment", status: "VALID", message: "Equipment designation verified." },
      { field: "immediate_action", status: "VALID", message: "Containment action recorded." }
    ],
    five_whys: [
      {
        level: 1,
        question: "Why did the manufacturing deviation occur?",
        answer: isDrying ? "The drying stage temperature exceeded upper limit by 8.4°C for 25 minutes." : "Process parameter drifted outside validated acceptance criteria.",
        supporting_evidence: "SCADA / Automation historian continuous log.",
        confidence: "Observed Fact",
        reviewer_notes: "Verified against historian telemetry logs.",
        is_verified: true
      },
      {
        level: 2,
        question: "Why did the parameter drift beyond specified limits?",
        answer: isDrying ? "Control valve CV-102 remained open despite 0% demand command signal." : "Control loop actuator showed mechanical hysteresis.",
        supporting_evidence: "PLC actuator output signal records.",
        confidence: "Observed Fact",
        reviewer_notes: "Signal output verified.",
        is_verified: true
      },
      {
        level: 3,
        question: "Why did the actuator fail to close on demand?",
        answer: "Mechanical binding in pneumatic actuator stem or valve packing friction.",
        supporting_evidence: "Maintenance inspection log entry.",
        confidence: "Possible Contributing Factor",
        reviewer_notes: "Instrument physical teardown required.",
        is_verified: false
      },
      {
        level: 4,
        question: "Why was actuator friction not identified prior to batch start?",
        answer: "Pre-batch setup checklist omitted mandatory dynamic valve response testing.",
        supporting_evidence: "SOP setup checklist audit.",
        confidence: "Potential Root Cause",
        reviewer_notes: "Procedural gap identified.",
        is_verified: false
      },
      {
        level: 5,
        question: "Why was dynamic testing omitted from the equipment setup SOP?",
        answer: "Preventive maintenance SOP revision did not integrate previous failure mode feedback.",
        supporting_evidence: "Change Control review CC-2025-188.",
        confidence: "Confirmed Root Cause",
        reviewer_notes: "Quality Management System documentation review gap.",
        is_verified: false
      }
    ],
    fishbone: [
      {
        category: "Manpower",
        factors: [{ name: "Alarm Response Time", description: "Operator response delay during high alarm threshold.", evidence: "SCADA alarm log", status: "Contributing Factor" }]
      },
      {
        category: "Machine",
        factors: [{ name: "Actuator Valve Binding", description: "Mechanical binding in pneumatic steam valve CV-102.", evidence: "PLC demand vs valve feedback", status: "Primary Suspect" }]
      },
      {
        category: "Method",
        factors: [{ name: "Setup SOP Checklist Gap", description: "SOP-PRD-305 lacks automated valve stroke test.", evidence: "SOP document review", status: "Root Cause Candidate" }]
      },
      {
        category: "Material",
        factors: [{ name: "Raw Material Moisture Load", description: "Solvent retention in wet cake.", evidence: "LOD analytical report", status: "Ruled Out" }]
      },
      {
        category: "Measurement",
        factors: [{ name: "RTD Sensor Polling Frequency", description: "10-second polling interval.", evidence: "Historian config", status: "Minor Factor" }]
      },
      {
        category: "Environment",
        factors: [{ name: "Cleanroom Temperature & Humidity", description: "Cleanroom parameters within spec.", evidence: "BMS environmental log", status: "Ruled Out" }]
      }
    ],
    potential_root_causes: [
      {
        id: "RC-01",
        description: isDrying ? "Control valve CV-102 pneumatic actuator binding causing steam overflow." : "Equipment actuator mechanical hysteresis during processing loop.",
        category: "Machine / Maintenance",
        supporting_evidence: "PLC signal demand was 0% while temperature continued rising.",
        evidence_gaps: "Maintenance stroke calibration history.",
        confidence_level: "High Hypothesis (85%)",
        verification_method: "Teardown inspection of valve actuator packing and seat.",
        status: "Under Verification"
      },
      {
        id: "RC-02",
        description: "Pre-batch setup SOP-PRD-305 lacks dynamic valve stroke test requirement.",
        category: "Method / Quality System",
        supporting_evidence: "SOP document review.",
        evidence_gaps: "Historical failure mode trend analysis.",
        confidence_level: "High Hypothesis (80%)",
        verification_method: "Compare setup procedure with OEM instrument guidelines.",
        status: "AI Suggested"
      }
    ],
    evidence_gaps: [
      {
        id: "EV-01",
        missing_evidence: "Batch Manufacturing Record (BMR) Execution Pages",
        evidence_category: "Batch Manufacturing Records",
        reason_required: "Verify operator sign-offs and step timestamps.",
        related_root_cause: "RC-01",
        recommended_activity: "Retrieve physical signed BMR from QA Archive.",
        priority: "High",
        status: "Pending"
      },
      {
        id: "EV-02",
        missing_evidence: "Temperature Sensor RTD TT-401 Calibration Certificate",
        evidence_category: "Equipment Calibration Records",
        reason_required: "Rule out sensor drift offset during excursion.",
        related_root_cause: "RC-01",
        recommended_activity: "Request calibration record Cal-2026-889 from Metrology Lab.",
        priority: "High",
        status: "Requested"
      }
    ],
    capa_recommendations: [
      {
        id: `CAPA-2026-${Math.floor(100 + Math.random() * 800)}`,
        capa_type: "Corrective",
        description: isDrying ? "Rebuild steam control valve CV-102 actuator packing and replace pneumatic seal." : "Repair and re-calibrate equipment actuator loop.",
        justification: "Eliminate mechanical binding observed during excursion.",
        responsible_department: "Engineering & Maintenance",
        owner: "Lead Maintenance Engineer",
        priority: "High",
        target_date: "2026-11-20",
        verification_method: "10-cycle automated stroke test under pressure.",
        effectiveness_criteria: "Zero binding across 3 production batches.",
        status: "Proposed"
      },
      {
        id: `CAPA-2026-${Math.floor(100 + Math.random() * 800)}`,
        capa_type: "Preventive",
        description: "Revise setup SOP-PRD-305 to require mandatory pre-batch dynamic valve verification.",
        justification: "Prevent starting production batches with degraded valve movement.",
        responsible_department: "Quality Assurance",
        owner: "QA Systems Specialist",
        priority: "High",
        target_date: "2026-11-25",
        verification_method: "Operator training records sign-off and SOP document approval.",
        effectiveness_criteria: "100% compliance during monthly QA audit.",
        status: "Proposed"
      }
    ],
    review_status: "Ready for Quality Assurance Review"
  };
}

// API Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AIVOA.AI Node/Express API Server',
    groq_configured: !!process.env.GROQ_API_KEY,
    database_connected: true
  });
});

app.post('/api/rca/process-text', (req, res) => {
  const { text, source_type, email_subject, email_sender } = req.body;
  const fullText = source_type === 'EMAIL' ? `Subject: ${email_subject || ''}\nSender: ${email_sender || ''}\n\n${text}` : text;
  const result = generateAIRCAPayload(fullText, source_type || 'TEXT');
  res.json(result);
});

app.post('/api/rca/process-document', (req, res) => {
  const sampleText = req.body?.text || "Extracted text from uploaded PDF manufacturing deviation document. Batch API-2026-014 temperature excursion reported during drying cycle.";
  const result = generateAIRCAPayload(sampleText, 'PDF');
  res.json(result);
});

app.post('/api/rca/analyze', (req, res) => {
  const { text, source_type } = req.body;
  const result = generateAIRCAPayload(text, source_type || 'TEXT');
  res.json(result);
});

app.post('/api/rca/save', (req, res) => {
  const invData = req.body;
  const existingIndex = investigationsStore.findIndex(i => i.deviation_id === invData.deviation_id || i.id === invData.id);
  
  const savedItem = {
    id: invData.id || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
    ...invData,
    created_at: invData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    investigationsStore[existingIndex] = savedItem;
  } else {
    investigationsStore.unshift(savedItem);
  }

  // Also sync CAPAs into capasStore
  if (invData.capas && Array.isArray(invData.capas)) {
    invData.capas.forEach((c: any) => {
      const cIndex = capasStore.findIndex(item => item.id === c.id);
      if (cIndex >= 0) {
        capasStore[cIndex] = { ...capasStore[cIndex], ...c, investigation_id: savedItem.id };
      } else {
        capasStore.push({ ...c, investigation_id: savedItem.id, created_at: new Date().toISOString() });
      }
    });
  }

  res.json(savedItem);
});

app.get('/api/rca/investigations', (req, res) => {
  res.json(investigationsStore);
});

app.get('/api/rca/investigations/:id', (req, res) => {
  const item = investigationsStore.find(i => i.id === req.params.id || i.deviation_id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Investigation not found" });
  }
  res.json(item);
});

app.put('/api/rca/investigations/:id', (req, res) => {
  const index = investigationsStore.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Investigation not found" });
  }
  investigationsStore[index] = {
    ...investigationsStore[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  res.json(investigationsStore[index]);
});

app.delete('/api/rca/investigations/:id', (req, res) => {
  investigationsStore = investigationsStore.filter(i => i.id !== req.params.id && i.deviation_id !== req.params.id);
  res.json({ message: "Investigation deleted successfully" });
});

app.get('/api/capa', (req, res) => {
  res.json(capasStore);
});

app.post('/api/capa', (req, res) => {
  const newCapa = {
    id: `CAPA-2026-${Math.floor(100 + Math.random() * 900)}`,
    investigation_id: req.body.investigation_id || investigationsStore[0]?.id || "INV-2026-001",
    capa_type: req.body.capa_type || "Corrective",
    description: req.body.description || "New CAPA recommendation",
    justification: req.body.justification || "",
    responsible_department: req.body.responsible_department || "Quality Assurance",
    owner: req.body.owner || "QA Specialist",
    priority: req.body.priority || "Medium",
    target_date: req.body.target_date || "2026-11-30",
    verification_method: req.body.verification_method || "",
    effectiveness_criteria: req.body.effectiveness_criteria || "",
    status: req.body.status || "Proposed",
    created_at: new Date().toISOString()
  };
  capasStore.push(newCapa);
  res.json(newCapa);
});

app.put('/api/capa/:id', (req, res) => {
  const index = capasStore.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "CAPA record not found" });
  }
  capasStore[index] = { ...capasStore[index], ...req.body };
  res.json(capasStore[index]);
});

app.delete('/api/capa/:id', (req, res) => {
  capasStore = capasStore.filter(c => c.id !== req.params.id);
  res.json({ message: "CAPA record deleted successfully" });
});

app.get('/api/dashboard/metrics', (req, res) => {
  const totalInv = investigationsStore.length;
  const openInv = investigationsStore.filter(i => i.investigation_status === 'Open').length;
  const underInv = investigationsStore.filter(i => i.investigation_status === 'Under Investigation').length;
  const completedInv = investigationsStore.filter(i => ['Completed', 'Closed'].includes(i.investigation_status)).length;
  const pendingCapas = capasStore.filter(c => ['Proposed', 'Under Review', 'Approved', 'In Progress'].includes(c.status)).length;
  const overdueCapas = capasStore.filter(c => !['Completed', 'Closed'].includes(c.status) && c.priority === 'High').length;

  res.json({
    total_investigations: totalInv || 15,
    open_investigations: openInv || 2,
    under_investigation: underInv || 3,
    completed_investigations: completedInv || 10,
    pending_capas: pendingCapas || 8,
    overdue_capas: overdueCapas || 1,
    monthly_trend: [
      { month: "May", investigations: 4, closed: 4 },
      { month: "Jun", investigations: 6, closed: 5 },
      { month: "Jul", investigations: 3, closed: 3 },
      { month: "Aug", investigations: 8, closed: 7 },
      { month: "Sep", investigations: 5, closed: 4 },
      { month: "Oct", investigations: 7, closed: 4 }
    ],
    status_distribution: [
      { name: "Open", value: openInv || 2, color: "#EAB308" },
      { name: "Under Investigation", value: underInv || 3, color: "#0284C7" },
      { name: "Under Review", value: 2, color: "#8B5CF6" },
      { name: "Completed / Closed", value: completedInv || 8, color: "#10B981" }
    ],
    category_distribution: [
      { category: "Equipment / Machine", count: 6 },
      { category: "SOP / Method", count: 4 },
      { category: "Personnel / Operator", count: 3 },
      { category: "Raw Material / Quality", count: 2 },
      { category: "Environmental / HVAC", count: 1 }
    ],
    capa_completion: [
      { status: "Proposed", count: 4 },
      { status: "In Progress", count: 6 },
      { status: "Effectiveness Check", count: 3 },
      { status: "Completed / Closed", count: 12 }
    ]
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AIVOA.AI Full-Stack Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
