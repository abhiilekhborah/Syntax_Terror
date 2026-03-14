import { useState, useRef, useCallback } from 'react';
import styles from './ReportIssue.module.css';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const CATEGORIES = [
  { id: 'pothole',      icon: '🕳️', label: 'Pothole'      },
  { id: 'streetlight',  icon: '💡', label: 'Street Light'  },
  { id: 'garbage',      icon: '🗑️', label: 'Garbage'       },
  { id: 'water',        icon: '💧', label: 'Water Leak'    },
  { id: 'tree',         icon: '🌳', label: 'Fallen Tree'   },
  { id: 'other',        icon: '🚧', label: 'Other'         },
];

const SEVERITIES = [
  { id: 'low',  emoji: '🟢', label: 'Low',    sub: 'Minor inconvenience', cls: styles.severityLow  },
  { id: 'med',  emoji: '🟡', label: 'Medium', sub: 'Needs attention',     cls: styles.severityMed  },
  { id: 'high', emoji: '🔴', label: 'High',   sub: 'Safety hazard',       cls: styles.severityHigh },
];

const STEPS = [
  { id: 1, label: 'Category'    },
  { id: 2, label: 'Details'     },
  { id: 3, label: 'Location'    },
  { id: 4, label: 'Evidence'    },
];

const MAX_DESCRIPTION = 500;
const MAX_FILES       = 5;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function generateId() {
  return 'CVP-' + Math.floor(1000 + Math.random() * 9000);
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Multi-step progress bar */
function Stepper({ current }) {
  return (
    <div className={styles.stepper}>
      {STEPS.map((step, i) => {
        const state =
          step.id < current ? 'done' :
          step.id === current ? 'active' : '';
        return (
          <div key={step.id} style={{ display: 'contents' }}>
            {i > 0 && (
              <div
                className={`${styles.stepConnector} ${
                  STEPS[i - 1].id < current ? styles.stepConnectorDone : ''
                }`}
              />
            )}
            <div
              className={`${styles.stepItem} ${
                state === 'active' ? styles.stepActive :
                state === 'done'   ? styles.stepDone   : ''
              }`}
            >
              <div className={styles.stepCircle}>
                {state === 'done' ? '✓' : step.id}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Step 1 — Category picker */
function StepCategory({ category, onChange }) {
  return (
    <div className={styles.stepPanel}>
      <div className={styles.sectionTitle}>What type of issue are you reporting?</div>
      <div className={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.catBtn} ${category === cat.id ? styles.catBtnSelected : ''}`}
            onClick={() => onChange(cat.id)}
          >
            <span className={styles.catIcon}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Step 2 — Title, description, severity */
function StepDetails({ form, errors, onChange }) {
  const descLen = form.description.length;
  const overLimit = descLen > MAX_DESCRIPTION;

  return (
    <div className={styles.stepPanel}>
      <div className={styles.formGrid}>

        {/* Issue Title */}
        <div className={`${styles.field} ${styles.formFull}`}>
          <label className={styles.label} htmlFor="ri-title">Issue Title</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>✏️</span>
            <input
              id="ri-title"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              type="text"
              placeholder="Brief description of the problem"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              maxLength={120}
            />
          </div>
          {errors.title && (
            <span className={styles.fieldError}>⚠ {errors.title}</span>
          )}
        </div>

        {/* Description */}
        <div className={`${styles.field} ${styles.formFull}`}>
          <label className={styles.label} htmlFor="ri-desc">Detailed Description</label>
          <textarea
            id="ri-desc"
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            placeholder="Describe the issue in detail — when you noticed it, how severe it is, any safety concerns…"
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={5}
          />
          <div
            className={`${styles.charCount} ${
              overLimit ? styles.charCountOver :
              descLen > MAX_DESCRIPTION * 0.85 ? styles.charCountWarn : ''
            }`}
          >
            {descLen} / {MAX_DESCRIPTION}
          </div>
          {errors.description && (
            <span className={styles.fieldError}>⚠ {errors.description}</span>
          )}
        </div>

        {/* Severity */}
        <div className={`${styles.field} ${styles.formFull}`}>
          <label className={styles.label}>Severity</label>
          <div className={styles.severityGrid}>
            {SEVERITIES.map((sev) => (
              <button
                key={sev.id}
                type="button"
                className={`${styles.severityBtn} ${sev.cls} ${
                  form.severity === sev.id ? styles.severitySelected : ''
                }`}
                onClick={() => onChange('severity', sev.id)}
              >
                <span className={styles.severityEmoji}>{sev.emoji}</span>
                <span className={styles.severityLabel}>{sev.label}</span>
                <div className={styles.severitySub}>{sev.sub}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/** Step 3 — Location */
function StepLocation({ form, errors, onChange }) {
  const [detecting, setDetecting] = useState(false);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange('location', `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 6000 }
    );
  }

  return (
    <div className={styles.stepPanel}>
      <div className={styles.formGrid}>

        {/* Location / Address */}
        <div className={`${styles.field} ${styles.formFull}`}>
          <label className={styles.label} htmlFor="ri-location">Location / Address</label>
          <div className={styles.locationRow}>
            <div className={`${styles.locationField} ${styles.inputWrap}`}>
              <span className={styles.inputIcon}>📍</span>
              <input
                id="ri-location"
                className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                type="text"
                placeholder="Street address or landmark"
                value={form.location}
                onChange={(e) => onChange('location', e.target.value)}
              />
            </div>
            <button
              type="button"
              className={styles.detectBtn}
              onClick={detectLocation}
              disabled={detecting}
              aria-label="Detect my location"
            >
              {detecting ? '⏳' : '🎯'} {detecting ? 'Detecting…' : 'Use My Location'}
            </button>
          </div>
          {errors.location && (
            <span className={styles.fieldError}>⚠ {errors.location}</span>
          )}
        </div>

        {/* Zone / Ward */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ri-zone">Zone / Ward</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>🗺️</span>
            <input
              id="ri-zone"
              className={styles.input}
              type="text"
              placeholder="e.g. Zone A, Ward 12"
              value={form.zone}
              onChange={(e) => onChange('zone', e.target.value)}
            />
          </div>
        </div>

        {/* Nearest Landmark */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ri-landmark">Nearest Landmark</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>🏛️</span>
            <input
              id="ri-landmark"
              className={styles.input}
              type="text"
              placeholder="e.g. near bus stand, market"
              value={form.landmark}
              onChange={(e) => onChange('landmark', e.target.value)}
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className={`${styles.field} ${styles.formFull}`}>
          <label className={styles.label} htmlFor="ri-notes">
            Additional Notes{' '}
            <span style={{ textTransform: 'none', opacity: 0.6, fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <textarea
            id="ri-notes"
            className={styles.textarea}
            placeholder="Any extra context that helps field workers locate and address the issue…"
            value={form.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={3}
          />
        </div>

      </div>
    </div>
  );
}

/** Step 4 — Photo evidence upload */
function StepEvidence({ previews, onAddFiles, onRemoveFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((fileList) => {
    const valid = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024)
      .slice(0, MAX_FILES - previews.length);
    if (valid.length) onAddFiles(valid);
  }, [previews.length, onAddFiles]);

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className={styles.stepPanel}>
      <div className={styles.sectionTitle}>Photo Evidence</div>

      <div
        className={`${styles.uploadZone} ${dragging ? styles.uploadZoneDragging : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true);  }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          className={styles.uploadInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className={styles.uploadIcon}>📷</div>
        <div className={styles.uploadText}>
          Drop photos here or{' '}
          <span className={styles.uploadBrowse}>browse</span>
        </div>
        <div className={styles.uploadHint}>
          JPEG, PNG, WEBP — up to 10 MB each · max {MAX_FILES} photos
        </div>
      </div>

      {previews.length > 0 && (
        <div className={styles.previewGrid}>
          {previews.map((p, i) => (
            <div key={i} className={styles.previewItem}>
              <img src={p.url} alt={`Preview ${i + 1}`} className={styles.previewImg} />
              <button
                type="button"
                className={styles.previewRemove}
                onClick={() => onRemoveFile(i)}
                aria-label={`Remove photo ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Success screen shown after submission */
function SuccessScreen({ reportId, onNewReport, onNavigate }) {
  return (
    <div className={styles.successCard}>
      <span className={styles.successIcon}>🎉</span>
      <div className={styles.successTitle}>Report Submitted!</div>
      <div className={styles.successId}>{reportId}</div>
      <p className={styles.successText}>
        Your issue has been logged and will be reviewed shortly. You'll receive
        notifications as it progresses through the pipeline.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className={styles.btnPrimary} onClick={() => onNavigate('myissues')}>
          Track My Report →
        </button>
        <button className={styles.btnGhost} onClick={onNewReport}>
          Report Another
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
/**
 * ReportIssue — 4-step wizard for submitting a new civic issue.
 *
 * Props:
 *  - onSubmit   {function}  called with the final form payload on submit
 *  - onNavigate {function}  navigate to another page: onNavigate('myissues')
 */
export default function ReportIssue({ onSubmit, onNavigate = () => {} }) {
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId,  setReportId]  = useState('');
  const [toast,     setToast]     = useState('');
  const [errors,    setErrors]    = useState({});

  const [category, setCategory] = useState('');

  const [form, setForm] = useState({
    title:       '',
    description: '',
    severity:    'high',
    location:    '',
    zone:        '',
    landmark:    '',
    notes:       '',
  });

  const [previews, setPreviews] = useState([]); // [{ url, file }]

  // ── Field update ─────────────────────────
  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  // ── Validation per step ──────────────────
  function validateStep(s) {
    const errs = {};
    if (s === 1 && !category) {
      errs.category = 'Please select a category.';
    }
    if (s === 2) {
      if (!form.title.trim())
        errs.title = 'Title is required.';
      if (form.description.length > MAX_DESCRIPTION)
        errs.description = `Keep it under ${MAX_DESCRIPTION} characters.`;
    }
    if (s === 3 && !form.location.trim()) {
      errs.location = 'Please enter a location.';
    }
    return errs;
  }

  // ── Step navigation ──────────────────────
  function goNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  // ── Photo handlers ───────────────────────
  function handleAddFiles(files) {
    const items = files.map((f) => ({ url: URL.createObjectURL(f), file: f }));
    setPreviews((prev) => [...prev, ...items].slice(0, MAX_FILES));
  }

  function handleRemoveFile(idx) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  // ── Draft save ───────────────────────────
  function saveDraft() {
    // Persist draft to localStorage in a real app
    showToast('✅ Draft saved successfully');
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // ── Final submit ─────────────────────────
  async function handleSubmit() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const id = generateId();

    const payload = {
      id,
      category,
      ...form,
      photos: previews.map((p) => p.file),
    };

    try {
      // Simulate API — replace with real call
      await new Promise((res) => setTimeout(res, 1500));
      if (onSubmit) onSubmit(payload);
      setReportId(id);
      setSubmitted(true);
    } catch {
      showToast('⚠ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Reset for new report ─────────────────
  function resetForm() {
    setStep(1);
    setCategory('');
    setForm({ title: '', description: '', severity: 'high', location: '', zone: '', landmark: '', notes: '' });
    setPreviews([]);
    setErrors({});
    setSubmitted(false);
    setReportId('');
  }

  // ── Render ───────────────────────────────
  return (
    <div className={styles.root}>
      <div className={styles.page}>

        {/* PAGE HEADER */}
        <div className={styles.pageHdr}>
          <div>
            <div className={styles.pageTitle}>Report an Issue</div>
            <div className={styles.pageSub}>Help keep your community clean and safe</div>
          </div>
        </div>

        {/* SUCCESS SCREEN */}
        {submitted ? (
          <SuccessScreen
            reportId={reportId}
            onNewReport={resetForm}
            onNavigate={onNavigate}
          />
        ) : (
          <>
            {/* STEPPER */}
            <Stepper current={step} total={STEPS.length} />

            {/* FORM CARD */}
            <div className={styles.formCard}>

              {/* Category error (step 1) */}
              {errors.category && step === 1 && (
                <div style={{
                  background: 'rgba(239,68,68,.08)',
                  border: '1px solid rgba(239,68,68,.25)',
                  borderRadius: 8,
                  padding: '0.6rem 0.9rem',
                  fontSize: '0.82rem',
                  color: 'var(--danger)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  ⚠ {errors.category}
                </div>
              )}

              {/* Step panels */}
              {step === 1 && (
                <StepCategory category={category} onChange={(id) => { setCategory(id); setErrors({}); }} />
              )}
              {step === 2 && (
                <StepDetails form={form} errors={errors} onChange={updateForm} />
              )}
              {step === 3 && (
                <StepLocation form={form} errors={errors} onChange={updateForm} />
              )}
              {step === 4 && (
                <StepEvidence
                  previews={previews}
                  onAddFiles={handleAddFiles}
                  onRemoveFile={handleRemoveFile}
                />
              )}

              <div className={styles.divider} />

              {/* NAVIGATION */}
              <div className={styles.actionRow}>
                {step > 1 && (
                  <button type="button" className={styles.btnBack} onClick={goBack}>
                    ← Back
                  </button>
                )}

                <button type="button" className={styles.btnGhost} onClick={saveDraft}>
                  Save Draft
                </button>

                {step < STEPS.length ? (
                  <button type="button" className={styles.btnNext} onClick={goNext}>
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.btnNext}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className={styles.spinner} /> Submitting…</>
                    ) : (
                      '📤 Submit Report'
                    )}
                  </button>
                )}
              </div>

            </div>
          </>
        )}

        {/* TOAST */}
        {toast && (
          <div className={styles.toast}>
            {toast}
          </div>
        )}

      </div>
    </div>
  );
}